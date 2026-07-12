/**
 * @file openrouter.js
 * @description OpenRouter provider adapter — "dumb", mirrors gemini.js's
 * contract exactly (name, supportsStreaming, supportsJsonMode, generate, stream).
 *
 * Uses the official `openai` npm package pointed at OpenRouter's
 * OpenAI-compatible endpoint, NOT the `@openrouter/sdk` package — OpenRouter's
 * own docs label that SDK "currently in beta, may have breaking changes
 * between versions" and recommend pinning it hard if used at all. The
 * `openai` package is mature/stable, and "swap the baseURL" is OpenRouter's
 * own documented integration path.
 *
 * @module lib/ai/openrouter
 * @author Nozibul Islam
 * @version 1.0.0
 */

const OpenAI = require('openai');
const { getTimeoutMs } = require('./config');
const {
  classifyThrown,
  ProviderTimeoutError,
  ProviderServerError,
} = require('./errors');

const PROVIDER_NAME = 'openrouter';

// Overridable via env, same pattern as gemini.js — a provider/model swap on
// OpenRouter's side never needs a code deploy.
const EXTRACTION_MODEL =
  process.env.OPENROUTER_EXTRACTION_MODEL || 'deepseek/deepseek-v4-pro';
const WRITER_MODEL =
  process.env.OPENROUTER_WRITER_MODEL || 'deepseek/deepseek-v4-pro';

let client = null;

const getClient = () => {
  if (client) return client;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    // Unreachable via the orchestrator in normal operation (config.js already
    // excludes 'openrouter' from routing if this key is missing) — only
    // fires if this adapter is called directly, bypassing the orchestrator.
    throw new Error('[openrouter-adapter] OPENROUTER_API_KEY is not set.');
  }

  client = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    // NOT cosmetic: the openai SDK retries 429/5xx/timeouts TWICE with
    // backoff by default, before an error ever reaches our code. That would
    // silently blow our per-provider timeout budget and violate our own
    // "no same-provider retry on rate-limit" policy from errors.js.
    maxRetries: 0,
    defaultHeaders: {
      // Reuses the project's existing BACKEND_URL (already in .env) rather
      // than introducing a redundant, parallel env var for the same
      // purpose (identifying this app to OpenRouter).
      'HTTP-Referer': process.env.BACKEND_URL || 'https://resumeletterai.app',
      'X-Title': 'ResumeLetterAI',
    },
  });
  return client;
};

/**
 * AbortController-based timeout is the authoritative mechanism here (same
 * as gemini.js) — the SDK's own `timeout` RequestOption is ALSO passed as a
 * redundant safety net (confirmed valid in official docs), since its exact
 * behavior during an active stream isn't clearly documented.
 */
const withTimeout = (timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const clear = () => clearTimeout(timer);
  return {
    signal: controller.signal,
    isAborted: () => controller.signal.aborted,
    clear,
  };
};

const isAbortLike = (err) =>
  err?.name === 'AbortError' ||
  err?.name === 'APIUserAbortError' ||
  err?.name === 'APIConnectionTimeoutError';

/**
 * Stage 1 — non-streaming call, expected to return JSON text.
 * Returns RAW text only — identical contract to gemini.js's generate().
 */
const generate = async ({ prompt, timeoutMs } = {}) => {
  const openai = getClient();
  const effectiveTimeout = timeoutMs ?? getTimeoutMs();
  const { signal, isAborted, clear } = withTimeout(effectiveTimeout);

  try {
    const response = await openai.chat.completions.create(
      {
        model: EXTRACTION_MODEL,
        messages: [{ role: 'user', content: prompt }],
        // Best-effort JSON mode — not every model behind OpenRouter honors
        // this consistently. shared/validation.js's parseExtractionJson()
        // already strips markdown fences defensively, so this is not a
        // single point of failure even when a model ignores the hint.
        response_format: { type: 'json_object' },
      },
      { signal, timeout: effectiveTimeout }
    );

    const text = response?.choices?.[0]?.message?.content;
    if (!text || !text.trim()) {
      const finishReason = response?.choices?.[0]?.finish_reason;
      throw new ProviderServerError(
        PROVIDER_NAME,
        new Error(
          `Empty response body${finishReason ? ` (finish_reason: ${finishReason})` : ''}`
        )
      );
    }

    return text;
  } catch (err) {
    if (isAborted() || isAbortLike(err)) {
      throw new ProviderTimeoutError(PROVIDER_NAME, err, effectiveTimeout);
    }
    throw classifyThrown(PROVIDER_NAME, err);
  } finally {
    clear();
  }
};

/**
 * Stage 2 — streaming call. Identical contract to gemini.js's stream():
 * emits chunks via onChunk, returns full text, tags thrown errors with
 * `.streamStarted` for the orchestrator's fallback-safety check.
 */
const stream = async ({
  prompt,
  systemInstruction,
  onChunk,
  timeoutMs,
} = {}) => {
  const openai = getClient();
  const effectiveTimeout = timeoutMs ?? getTimeoutMs();
  const { signal, isAborted, clear } = withTimeout(effectiveTimeout);

  let streamStarted = false;
  let fullText = '';

  const messages = systemInstruction
    ? [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ]
    : [{ role: 'user', content: prompt }];

  try {
    const completionStream = await openai.chat.completions.create(
      {
        model: WRITER_MODEL,
        messages,
        stream: true,
      },
      { signal, timeout: effectiveTimeout }
    );

    for await (const chunk of completionStream) {
      const chunkText = chunk?.choices?.[0]?.delta?.content;
      if (!chunkText) continue; // role-only / keepalive chunks carry no text delta

      streamStarted = true;
      fullText += chunkText;
      onChunk?.(chunkText);
    }

    if (!fullText.trim()) {
      // streamStarted is still false here — nothing reached the client —
      // so this stays safely fallback-eligible.
      throw new ProviderServerError(
        PROVIDER_NAME,
        new Error('Empty stream output')
      );
    }

    return fullText;
  } catch (err) {
    const typed =
      isAborted() || isAbortLike(err)
        ? new ProviderTimeoutError(PROVIDER_NAME, err, effectiveTimeout)
        : classifyThrown(PROVIDER_NAME, err);

    typed.streamStarted = streamStarted;
    throw typed;
  } finally {
    clear();
  }
};

module.exports = {
  name: PROVIDER_NAME,
  supportsStreaming: true,
  supportsJsonMode: true,
  generate,
  stream,
  EXTRACTION_MODEL,
  WRITER_MODEL,
};
