/**
 * @file orchestrator.js
 * @description Provider orchestrator — owns provider selection, retry policy,
 * and stage sequencing for cover letter generation. This is the ONLY place
 * that knows about "stage 1 then stage 2", retry limits, and how to turn a
 * ProviderError into a user-facing AppError. Adapters stay dumb; shared/
 * modules stay pure; this file wires them together.
 *
 * v1 (this step): Gemini-only. The per-stage helpers already take a
 * `provider` argument and are structured so step 8/9 (multi-provider
 * fallback) can wrap them in a loop without rewriting their internals.
 *
 * DELIBERATE SIMPLIFICATION — stage-2 quality retry:
 * Earlier design rounds agreed "hard violation -> retry stage 2 once".
 * That is NOT implemented here on purpose: stage 2 is token-streamed live
 * to the client, and quality can only be checked after the full body is
 * assembled -- by which point every token has already reached the client.
 * A silent server-side retry would either (a) diverge from what the client
 * already saw, or (b) require a new "discard and restart" SSE event the
 * frontend doesn't yet support. Hard violations are logged at high
 * severity instead (signal for prompt.js tuning) and delivered as-is.
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
const { checkLetterQuality, hasUsableExtraction } = require('./shared/quality');
const { getProviderPriority, getTimeoutMs } = require('./config');
const { ProviderError } = require('./errors');
const logger = require('./shared/logger');

const gemini = require('./gemini');
const openrouter = require('./openrouter');

// Every implemented adapter goes here. config.js decides WHICH provider
// names are usable (API key present); this map decides which ones
// physically exist as code. The two lists can diverge mid-migration (e.g.
// GROQ_API_KEY already sitting in .env before groq.js is written), so
// resolveActiveProviders() reconciles that defensively below instead of
// assuming they always match. Deliberately a plain lookup object, not a
// registry class -- 2-3 known adapters don't need dynamic registration.
//
// NOTE: registering openrouter here does NOT enable fallback yet --
// generateCoverLetter() still only ever uses activeProviders[0]. If both
// gemini and openrouter have API keys configured right now, gemini keeps
// winning (assuming default AI_PROVIDER_PRIORITY ordering). Multi-provider
// looping is step 8/9, not this step.
const AVAILABLE_ADAPTERS = {
  gemini,
  openrouter,
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
        `[orchestrator] "${name}" has a configured API key but no adapter is implemented yet -- skipping.`
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
 * match" -- that's a business outcome, and retrying with identical input
 * against a genuine resume/JD mismatch is a deterministic waste, not a
 * real second chance.
 *
 * @param {object} provider - adapter module (e.g. gemini.js)
 * @param {{resumeText: string, jobDescription: string}} input
 * @returns {Promise<object>} trimmed, schema-valid extraction data
 * @throws {AppError} on "no usable match" or after exhausting retries
 * @throws {ProviderError} on provider-level failure (caller translates to AppError)
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
        // Business outcome, not a technical failure -- never retry this.
        throw new AppError(
          'No strong matches found between resume and job description.',
          502
        );
      }

      return trimmed;
    } catch (err) {
      if (err instanceof AppError) throw err; // "no usable match" -- surface immediately

      if (err instanceof ExtractionValidationError) {
        lastValidationError = err;
        logger.warn(
          `[orchestrator] stage-1 extraction attempt ${attempt + 1} failed validation:`,
          err.message,
          err.issues
        );
        continue; // technical failure -- worth one retry, same provider
      }

      throw err; // unexpected error shape -- don't swallow it
    }
  }

  logger.error(
    '[orchestrator] stage-1 extraction failed after retry:',
    lastValidationError?.issues
  );
  throw new AppError(
    'AI could not analyze the resume against this job description. Please try again.',
    502
  );
};

// ============================================================
// STAGE 2 -- writing (streaming). See file header for why hard
// violations are logged, not retried.
// ============================================================

/**
 * Runs stage-2 writing against ONE provider. The opening scaffolding block
 * is buffered and only flushed together with the FIRST real model chunk --
 * this keeps "has the client received anything yet" strictly tied to real
 * model output, not app-side scaffolding, which matters once step 9 adds
 * real pre-stream fallback across providers.
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
    logger.error(
      '[orchestrator] stage-2 HARD quality violation (delivered as-is):',
      hard
    );
  }
  if (soft.length > 0) {
    logger.warn('[orchestrator] stage-2 soft quality note:', soft);
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
  // v1: single provider only. Step 8 will turn this into a loop over
  // activeProviders, calling runExtractionStage() per provider until one
  // succeeds -- runExtractionStage()'s signature already supports that.
  const { adapter: primaryProvider, name: providerName } = activeProviders[0];

  onStage?.('analyzing');
  const stage1Start = Date.now();

  let extracted;
  try {
    extracted = await runExtractionStage(primaryProvider, {
      resumeText,
      jobDescription,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;

    logger.error(
      `[orchestrator] stage-1 provider failure (${providerName}):`,
      err.message
    );
    const isRateLimit = err instanceof ProviderError && err.statusCode === 429;
    throw new AppError(
      isRateLimit
        ? 'AI service is temporarily rate-limited. Please try again in a minute, or later today.'
        : 'AI service is temporarily unavailable. Please try again.',
      isRateLimit ? 503 : 502
    );
  }

  logger.info(
    `[orchestrator] stage-1 (${providerName}) took ${Date.now() - stage1Start}ms`
  );

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

  let fullBody;
  try {
    fullBody = await runWritingStage(primaryProvider, {
      prompt: writerPrompt,
      systemInstruction,
      openingBlock,
      onChunk,
      tone,
    });
  } catch (err) {
    logger.error(
      `[orchestrator] stage-2 provider failure (${providerName}, streamStarted=${Boolean(err.streamStarted)}):`,
      err.message
    );
    const surfaced = new AppError(
      'AI service failed while writing your letter. Please try again.',
      502
    );
    // Lets the controller tell the frontend whether partial content already
    // reached the client (so it knows whether to discard what's on screen).
    surfaced.streamStarted = Boolean(err.streamStarted);
    throw surfaced;
  }

  logger.info(
    `[orchestrator] stage-2 (${providerName}) took ${Date.now() - stage2Start}ms`
  );

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
