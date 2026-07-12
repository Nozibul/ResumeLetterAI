/**
 * @file orchestrator.js
 * @description Provider orchestrator — owns provider selection, retry policy,
 * and stage sequencing for cover letter generation. This is the ONLY place
 * that knows about "stage 1 then stage 2", retry limits, and how to turn a
 * ProviderError into a user-facing AppError. Adapters stay dumb; shared/
 * modules stay pure; this file wires them together.
 *
 * v1 (step 5): Gemini-only. v2 (step 8): stage-1 tries every active
 * provider in priority order (runExtractionAcrossProviders), giving a
 * different model a "second opinion" on both technical failures (malformed
 * output) and business outcomes (no usable match). v3 (step 9): stage-2
 * (writing) also tries multiple providers (runWritingAcrossProviders),
 * starting with whichever provider won stage 1 -- but ONLY before any real
 * content has streamed to the client (err.streamStarted gates this; see
 * runWritingAcrossProviders' docstring). Once streaming has begun, no
 * further fallback is attempted for that request, by design.
 *
 * STEP 10 -- IMPLEMENTED AS A LOGGING POLICY, NOT RETRY:
 * Earlier design rounds planned Step 10 ("tiered post-validation") as
 * hard-violation -> retry stage 2 once. That plan is intentionally NOT what
 * runs here. Stage 2 is token-streamed live to the client, and quality can
 * only be checked after the full body is assembled -- by which point every
 * token has already reached the client. A silent server-side retry would
 * either (a) diverge from what the client already saw, or (b) require a
 * new "discard and restart" SSE event the frontend doesn't yet support.
 * Step 10 is implemented instead as: hard violations are logged at high
 * severity (signal for prompt.js tuning) and delivered as-is; soft
 * violations are logged at lower severity, also delivered as-is. See
 * checkLetterQuality() in shared/quality.js for the hard/soft classification,
 * and runWritingStage() below for where the logging happens.
 *
 * @module lib/ai/orchestrator
 * @author Nozibul Islam
 * @version 1.0.0
 */

const AppError = require('../../shared/utils/AppError');
const {
  buildMatchExtractionPrompt,
  buildCoverLetterPrompt,
  buildOpeningBlock,
  buildClosingBlock,
  wrapAsLetter,
} = require('./prompt');
const {
  normalizeExtraction,
  trimExtraction,
  buildContactLine,
} = require('./shared/extraction');
const {
  validateExtraction,
  parseExtractionJson,
  ExtractionValidationError,
} = require('./shared/validation');
const {
  checkLetterQuality,
  hasUsableExtraction,
  NoUsableMatchError,
} = require('./shared/quality');
const { getProviderPriority, getTimeoutMs } = require('./config');
const { ProviderError } = require('./errors');
const logger = require('./shared/logger');
const { logProviderAttempt } = logger;
const { createCircuitBreaker } = require('./shared/circuitBreaker');
const { createRedisStore } = require('./shared/redisStore');

const gemini = require('./gemini');
const openrouter = require('./openrouter');
const groq = require('./groq');

// Single circuit breaker instance for this process, backed by Redis --
// shared across every request this process handles, AND across every
// other instance/process in production (that's the whole point: a
// serverless deployment with N instances all see the same circuit state,
// not N independent, unaware copies).
const circuitBreaker = createCircuitBreaker(createRedisStore());

// Every implemented adapter goes here. config.js decides WHICH provider
// names are usable (API key present); this map decides which ones
// physically exist as code. Deliberately a plain lookup object, not a
// registry class -- 2-3 known adapters don't need dynamic registration.
//
// NOTE: both stages now loop across all three (runExtractionAcrossProviders
// for stage 1, runWritingAcrossProviders for stage 2, gated by
// streamStarted -- step 8 and step 9 respectively).
const AVAILABLE_ADAPTERS = {
  gemini,
  openrouter,
  groq,
};

const EXTRACTION_RETRY_LIMIT = 1; // total attempts = 1 + this

/**
 * Resolves the configured priority list (env, via config.js) down to
 * providers that actually have an adapter implemented. A provider that's
 * "configured" (API key present) but not yet coded is skipped with a
 * warning rather than crashing the request.
 * @returns {Array<{name: string, adapter: object}>}
 */
const resolveActiveProviders = () => {
  const configured = getProviderPriority();

  const active = configured
    .map((name) => ({ name, adapter: AVAILABLE_ADAPTERS[name] }))
    .filter(({ name, adapter }) => {
      if (adapter) return true;
      logger.warn(
        'Adapter not implemented for configured provider -- skipping',
        {
          provider: name,
        }
      );
      return false;
    });

  if (active.length === 0) {
    throw new AppError('AI service is not configured.', 503);
  }

  return active;
};

// ============================================================
// STAGE 1 -- extraction (non-streaming, safe to retry freely --
// nothing has reached the client yet at this point)
// ============================================================

/**
 * Runs stage-1 extraction against ONE provider, with a bounded retry ONLY
 * for technical failures (malformed JSON / schema-invalid output). Never
 * retries a provider-level failure (rate limit etc -- errors.js already
 * marks these retryable:false) and never retries "valid JSON, no real
 * match" with the SAME provider -- identical input against the same model's
 * judgment is a deterministic repeat, not a real second chance.
 *
 * Throws distinguishable, UNWRAPPED errors (not AppError) on purpose -- the
 * caller (runExtractionAcrossProviders) decides whether to try the next
 * provider or give up, and only the final AppError-translation step (in
 * generateCoverLetter) needs to know which case actually occurred.
 *
 * @param {object} provider - adapter module (e.g. gemini.js)
 * @param {{resumeText: string, jobDescription: string}} input
 * @returns {Promise<object>} trimmed, schema-valid extraction data
 * @throws {NoUsableMatchError} valid output, but no genuine resume/JD match
 * @throws {ExtractionValidationError} malformed/invalid output after exhausting retries
 * @throws {ProviderError} provider-level failure (network, rate limit, auth, etc)
 */
const runExtractionStage = async (provider, { resumeText, jobDescription }) => {
  const prompt = buildMatchExtractionPrompt({ resumeText, jobDescription });
  const timeoutMs = getTimeoutMs();

  let lastValidationError;

  for (let attempt = 0; attempt <= EXTRACTION_RETRY_LIMIT; attempt++) {
    // Provider-level call is OUTSIDE the retry-on-validation-error path on
    // purpose -- a ProviderError here propagates immediately, no retry.
    const rawText = await provider.generate({ prompt, timeoutMs });

    try {
      const parsed = parseExtractionJson(rawText);
      const normalized = normalizeExtraction(parsed);
      const validated = validateExtraction(normalized);
      const trimmed = trimExtraction(validated);

      if (!hasUsableExtraction(trimmed)) {
        // Business outcome, not a technical failure -- never retry the SAME
        // provider, but the caller may still try a different one.
        throw new NoUsableMatchError();
      }

      return trimmed;
    } catch (err) {
      if (err instanceof NoUsableMatchError) throw err; // let the caller decide fallback

      if (err instanceof ExtractionValidationError) {
        lastValidationError = err;
        logger.warn('Stage-1 extraction attempt failed validation', {
          attempt: attempt + 1,
          errorMessage: err.message,
          issues: err.issues,
        });
        continue; // technical failure -- worth one retry, same provider
      }

      throw err; // unexpected error shape -- don't swallow it
    }
  }

  logger.warn('Stage-1 extraction exhausted retries on this provider', {
    issues: lastValidationError?.issues,
  });
  throw lastValidationError; // let the caller decide whether to try the next provider
};

/**
 * Tries stage-1 extraction across every active provider, in priority order,
 * until one succeeds. This is where "no usable match" and "malformed
 * output" get a second opinion from a DIFFERENT model -- see file header
 * for why that's meaningfully different from same-provider retry.
 *
 * Stops immediately (no further providers tried) only for
 * ProviderBadRequestError (fallbackEligible: false) -- that error type
 * specifically means "our request construction is likely broken", and
 * since every adapter receives a structurally similar prompt, trying the
 * next provider would probably just repeat the same mistake at extra cost.
 *
 * @param {Array<{name: string, adapter: object}>} providers
 * @param {{resumeText: string, jobDescription: string}} input
 * @returns {Promise<{extracted: object, providerName: string}>}
 * @throws {AppError} once every provider has been tried without success
 * @throws {ProviderError} immediately, for a BadRequestError (not fallback-eligible)
 */
const runExtractionAcrossProviders = async (providers, input) => {
  let sawNoUsableMatch = false;
  let lastError;
  let attemptedAny = false;

  for (const { name, adapter } of providers) {
    const available = await circuitBreaker.isAvailable(name);
    if (!available) {
      logger.warn('Circuit open -- skipping provider without calling it', {
        stage: 'extraction',
        provider: name,
      });
      continue;
    }

    attemptedAny = true;
    const attemptStart = Date.now();
    try {
      const extracted = await runExtractionStage(adapter, input);
      void circuitBreaker.recordSuccess(name); // fire-and-forget -- see circuitBreaker.js; never throws
      logProviderAttempt({
        stage: 'extraction',
        provider: name,
        outcome: 'success',
        durationMs: Date.now() - attemptStart,
      });
      return { extracted, providerName: name };
    } catch (err) {
      lastError = err;
      const durationMs = Date.now() - attemptStart;

      if (err instanceof NoUsableMatchError) {
        // The provider responded successfully with valid output -- it just
        // didn't find a match. Not a provider-health signal, so the
        // circuit is NOT penalized for this.
        sawNoUsableMatch = true;
        logProviderAttempt({
          stage: 'extraction',
          provider: name,
          outcome: 'failure',
          durationMs,
          errorType: 'NoUsableMatchError',
          detail: 'trying_next_provider',
        });
        continue;
      }

      if (err instanceof ExtractionValidationError) {
        void circuitBreaker.recordFailure(name);
        logProviderAttempt({
          stage: 'extraction',
          provider: name,
          outcome: 'failure',
          durationMs,
          errorType: 'ExtractionValidationError',
          detail: 'trying_next_provider',
        });
        continue;
      }

      if (err instanceof ProviderError) {
        if (!err.fallbackEligible) {
          // Our own bug (e.g. BadRequestError) -- don't blame this
          // provider's circuit for it, and don't try the next one either.
          logProviderAttempt({
            stage: 'extraction',
            provider: name,
            outcome: 'failure',
            durationMs,
            errorType: err.name,
            detail: 'non_fallback_eligible',
          });
          throw err;
        }
        void circuitBreaker.recordFailure(name);
        logProviderAttempt({
          stage: 'extraction',
          provider: name,
          outcome: 'failure',
          durationMs,
          errorType: err.name,
          detail: 'trying_next_provider',
        });
        continue; // rate limit / timeout / server / auth -- try next provider
      }

      throw err; // unexpected error shape -- don't swallow it
    }
  }

  // Every provider exhausted without success.
  if (sawNoUsableMatch) {
    throw new AppError(
      'No strong matches found between resume and job description.',
      502
    );
  }
  if (!attemptedAny) {
    // Every provider was circuit-open -- lastError was never set, so
    // `throw lastError` here would throw undefined. Give a clear,
    // dedicated error instead.
    throw new AppError(
      'AI service is temporarily unavailable (all providers cooling down). Please try again shortly.',
      503
    );
  }
  throw lastError; // preserve the last technical failure for the caller to translate
};

/**
 * Tries stage-2 writing across the given providers, in order, until one
 * succeeds -- but ONLY while nothing has reached the client yet.
 *
 * runWritingStage() tracks, per attempt, whether the opening scaffolding
 * block was ever actually flushed to onChunk (which only happens together
 * with that attempt's first real model chunk). If an attempt fails AFTER
 * that point (err.streamStarted === true), the client has already seen
 * partial, real content -- falling back to a different provider at that
 * point would either duplicate content or silently discard what the client
 * already saw, exactly the broken UX this whole design exists to avoid.
 * streamStarted is therefore checked FIRST, before even asking whether the
 * error is normally fallback-eligible -- it overrides that.
 *
 * Each provider gets exactly one attempt here -- stage 2 deliberately has
 * no "retry the same provider" path (see file header: quality-triggered
 * retry is unsafe once tokens are already streaming).
 *
 * @param {Array<{name: string, adapter: object}>} providers
 * @param {object} params - forwarded to runWritingStage unchanged
 * @returns {Promise<{fullBody: string, providerName: string}>}
 * @throws the triggering error (tagged `.streamStarted`) once every given
 *   provider has failed pre-stream, or immediately if streamStarted became
 *   true, or immediately for a non-fallback-eligible ProviderError
 */
const runWritingAcrossProviders = async (providers, params) => {
  let lastError;
  let attemptedAny = false;

  for (const { name, adapter } of providers) {
    const available = await circuitBreaker.isAvailable(name);
    if (!available) {
      logger.warn('Circuit open -- skipping provider without calling it', {
        stage: 'writing',
        provider: name,
      });
      continue;
    }

    attemptedAny = true;
    const attemptStart = Date.now();
    try {
      const fullBody = await runWritingStage(adapter, params);
      void circuitBreaker.recordSuccess(name); // fire-and-forget -- never throws
      logProviderAttempt({
        stage: 'writing',
        provider: name,
        outcome: 'success',
        durationMs: Date.now() - attemptStart,
      });
      return { fullBody, providerName: name };
    } catch (err) {
      lastError = err;
      const durationMs = Date.now() - attemptStart;

      if (err instanceof ProviderError && !err.fallbackEligible) {
        // Our own bug -- don't penalize this provider's circuit for it.
        logProviderAttempt({
          stage: 'writing',
          provider: name,
          outcome: 'failure',
          durationMs,
          errorType: err.name,
          detail: 'non_fallback_eligible',
        });
        throw err;
      }

      // Any other failure -- including a mid-stream drop -- reflects on
      // this provider's reliability right now, so the circuit IS
      // penalized regardless of streamStarted. streamStarted only decides
      // whether THIS REQUEST may try another provider; that's a separate
      // concern from whether this provider's circuit should open for
      // FUTURE requests.
      void circuitBreaker.recordFailure(name);

      if (err.streamStarted) {
        // Client already has partial real content -- stop here, no matter
        // how many providers remain untried.
        logProviderAttempt({
          stage: 'writing',
          provider: name,
          outcome: 'failure',
          durationMs,
          errorType: err.name || 'unknown',
          detail: 'mid_stream_no_fallback',
        });
        throw err;
      }

      logProviderAttempt({
        stage: 'writing',
        provider: name,
        outcome: 'failure',
        durationMs,
        errorType: err.name || 'unknown',
        detail: 'trying_next_provider',
      });
    }
  }

  if (!attemptedAny) {
    // Every provider was circuit-open -- lastError was never set. Give a
    // clear, dedicated error with `.streamStarted = false` so the
    // generateCoverLetter catch block (and the controller's `partial`
    // field) behaves correctly -- nothing was ever sent to the client.
    // Tagged `.allCircuitsOpen` so generateCoverLetter can surface a
    // specific message instead of the generic stage-2 failure text.
    const err = new Error('All providers are circuit-open for stage 2');
    err.streamStarted = false;
    err.allCircuitsOpen = true;
    throw err;
  }
  throw lastError;
};

/**
 * Orders providers for stage 2: the provider that won stage 1 goes first
 * (already proven healthy this request), followed by the remaining active
 * providers as fallback candidates if it fails before streaming starts.
 * @param {Array<{name: string, adapter: object}>} activeProviders
 * @param {string} stage1ProviderName
 * @returns {Array<{name: string, adapter: object}>}
 */
const buildStage2ProviderOrder = (activeProviders, stage1ProviderName) => {
  const winner = activeProviders.find((p) => p.name === stage1ProviderName);
  const rest = activeProviders.filter((p) => p.name !== stage1ProviderName);
  return winner ? [winner, ...rest] : activeProviders;
};

// ============================================================
// STAGE 2 -- writing (streaming). See file header for why hard
// violations are logged, not retried.
// ============================================================

/**
 * Runs stage-2 writing against ONE provider (single attempt, no internal
 * retry). The opening scaffolding block is buffered and only flushed
 * together with the FIRST real model chunk -- this keeps "has the client
 * received anything yet" strictly tied to real model output, which is what
 * lets runWritingAcrossProviders() (step 9) safely decide whether falling
 * back to another provider is still possible for a given failure.
 *
 * @param {object} provider
 * @param {object} params
 * @returns {Promise<string>} full body text
 */
const runWritingStage = async (
  provider,
  { prompt, systemInstruction, openingBlock, onChunk, tone }
) => {
  const timeoutMs = getTimeoutMs();
  let openingSent = false;

  const forwardChunk = (chunkText) => {
    if (!openingSent) {
      onChunk?.(openingBlock);
      openingSent = true;
    }
    onChunk?.(chunkText);
  };

  let fullBody;
  try {
    fullBody = await provider.stream({
      prompt,
      systemInstruction,
      onChunk: forwardChunk,
      timeoutMs,
    });
  } catch (err) {
    // Orchestrator-level truth about client-visible content takes priority
    // over the adapter's own internal flag (defense in depth -- see file header).
    err.streamStarted = err.streamStarted || openingSent;
    throw err;
  }

  const { hard, soft } = checkLetterQuality(fullBody, { tone });

  if (hard.length > 0) {
    // Deliberately NOT retried -- see file header. Logged loudly as a
    // prompt-tuning signal, delivered as-is.
    logger.error('Stage-2 HARD quality violation (delivered as-is)', {
      violations: hard,
    });
  }
  if (soft.length > 0) {
    logger.warn('Stage-2 soft quality note', { violations: soft });
  }

  return fullBody;
};

// ============================================================
// PUBLIC ENTRY POINT -- same signature as the old provider.js /
// gemini.js's generateWithGemini, so CoverLetterService needs zero changes.
// ============================================================

/**
 * @param {object} params
 * @param {string} params.resumeText
 * @param {string} params.jobDescription
 * @param {string} [params.tone]
 * @param {string} [params.seniorityLevel]
 * @param {string|null} [params.accountFallbackName]
 * @param {(chunk: string) => void} [params.onChunk]
 * @param {(stage: string) => void} [params.onStage]
 * @returns {Promise<string>} the complete, ready-to-send cover letter
 */
const generateCoverLetter = async ({
  resumeText,
  jobDescription,
  tone,
  seniorityLevel,
  accountFallbackName,
  onChunk,
  onStage,
}) => {
  const activeProviders = resolveActiveProviders();

  onStage?.('analyzing');
  const stage1Start = Date.now();

  let extracted;
  let providerName;

  try {
    ({ extracted, providerName } = await runExtractionAcrossProviders(
      activeProviders,
      { resumeText, jobDescription }
    ));
  } catch (err) {
    if (err instanceof AppError) throw err;

    logger.error('Stage-1 failed across all active providers', {
      errorMessage: err.message,
    });
    const isRateLimit = err instanceof ProviderError && err.statusCode === 429;
    const isMalformed = err instanceof ExtractionValidationError;
    throw new AppError(
      isMalformed
        ? 'AI could not analyze the resume against this job description. Please try again.'
        : isRateLimit
          ? 'AI service is temporarily rate-limited. Please try again in a minute, or later today.'
          : 'AI service is temporarily unavailable. Please try again.',
      isRateLimit ? 503 : 502
    );
  }

  logger.info('Stage-1 completed', {
    provider: providerName,
    durationMs: Date.now() - stage1Start,
  });

  const {
    themeKeywords,
    companyName,
    companyReason,
    candidateName: extractedName,
    targetJobTitle,
    contactInfo,
    candidateValue,
    honestGap,
    availabilityNote,
    stories,
    capabilityGroups,
    candidateSeniorityGuess,
  } = extracted;

  // Resume-extracted name wins; account name is only a fallback.
  const finalName = extractedName || accountFallbackName || null;
  const contactLine = buildContactLine(contactInfo);

  const writerPrompt = buildCoverLetterPrompt({
    themeKeywords,
    companyName,
    companyReason,
    targetJobTitle,
    candidateValue,
    honestGap,
    availabilityNote,
    stories,
    capabilityGroups,
    tone,
    seniorityLevel: seniorityLevel || candidateSeniorityGuess,
  });

  const systemInstruction = `
You write the BODY of a first-person cover letter only.
Never write recruiter summaries. Never recommend the candidate. Never write in third person.
Never write a date, a salutation ("Dear ..."), a "Subject:" line, or a signature ("Sincerely," etc.) --
those are added separately by the application. Output only the four body paragraphs.
`;

  // Built here, but NOT sent yet -- runWritingStage() buffers and flushes
  // it together with the first real model chunk (see file header / earlier
  // conversation on why the old "send immediately" timing was unsafe).
  const openingBlock = buildOpeningBlock({
    contactLine,
    targetJobTitle,
    companyName,
  });

  onStage?.('writing');
  const stage2Start = Date.now();

  const stage2ProviderOrder = buildStage2ProviderOrder(
    activeProviders,
    providerName
  );

  let fullBody;
  let stage2ProviderName;
  try {
    ({ fullBody, providerName: stage2ProviderName } =
      await runWritingAcrossProviders(stage2ProviderOrder, {
        prompt: writerPrompt,
        systemInstruction,
        openingBlock,
        onChunk,
        tone,
      }));
  } catch (err) {
    logger.error('Stage-2 failed across all attempted providers', {
      streamStarted: Boolean(err.streamStarted),
      allCircuitsOpen: Boolean(err.allCircuitsOpen),
      errorMessage: err.message,
    });
    const surfaced = new AppError(
      err.allCircuitsOpen
        ? 'AI service is temporarily unavailable (all providers cooling down). Please try again shortly.'
        : 'AI service failed while writing your letter. Please try again.',
      err.allCircuitsOpen ? 503 : 502
    );
    // Lets the controller tell the frontend whether partial content already
    // reached the client (so it knows whether to discard what's on screen).
    surfaced.streamStarted = Boolean(err.streamStarted);
    throw surfaced;
  }

  logger.info('Stage-2 completed', {
    provider: stage2ProviderName,
    durationMs: Date.now() - stage2Start,
  });

  const closingBlock = buildClosingBlock({ candidateName: finalName });
  onChunk?.(closingBlock);

  // Persisted DB content mirrors exactly what the client streamed -- same
  // guarantee the original code made, unchanged here.
  return wrapAsLetter({
    body: fullBody,
    companyName,
    candidateName: finalName,
    contactLine,
    targetJobTitle,
  });
};

module.exports = { generateCoverLetter };
