/**
 * @file groq.js
 * @description Groq provider adapter — "dumb", mirrors gemini.js's and
 * openrouter.js's contract exactly (name, supportsStreaming, supportsJsonMode,
 * generate, stream).
 *
 * Uses the official `groq-sdk` npm package (stable, not beta). Groq's API is
 * OpenAI-compatible and their SDK is Stainless-generated just like
 * `openai-node` -- same method shapes, same error class names
 * (APIConnectionTimeoutError), same default-retry behavior -- so the same
 * "set maxRetries: 0 explicitly" lesson from openrouter.js applies here too.
 *
 * @module lib/ai/groq
 * @author Nozibul Islam
 * @version 1.0.0
 */

const Groq = require('groq-sdk');
const { getTimeoutMs } = require('./config');
const {
  classifyThrown,
  ProviderTimeoutError,
  ProviderServerError,
} = require('./errors');

const PROVIDER_NAME = 'groq';

// Overridable via env, same pattern as gemini.js / openrouter.js.
const EXTRACTION_MODEL =
  process.env.GROQ_EXTRACTION_MODEL || 'llama-3.3-70b-versatile';
const WRITER_MODEL = process.env.GROQ_WRITER_MODEL || 'llama-3.3-70b-versatile';

let client = null;

const getClient = () => {
  if (client) return client;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    // Unreachable via the orchestrator in normal operation (config.js already
    // excludes 'groq' from routing if this key is missing) — only fires if
    // this adapter is called directly, bypassing the orchestrator.
    throw new Error('[groq-adapter] GROQ_API_KEY is not set.');
  }

  client = new Groq({
    apiKey,
    // Same reasoning as openrouter.js: the SDK retries 429/5xx/timeouts
    // TWICE with backoff by default, before an error ever reaches our code.
    // That would silently blow our per-provider timeout budget and violate
    // our own "no same-provider retry on rate-limit" policy from errors.js.
    maxRetries: 0,
  });
  return client;
};

/**
 * AbortController-based timeout is the authoritative mechanism (same as
 * gemini.js / openrouter.js) — the SDK's own `timeout` RequestOption is ALSO
 * passed as a redundant safety net.
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
 * Returns RAW text only — identical contract to the other adapters.
 */
const generate = async ({ prompt, timeoutMs } = {}) => {
  const groq = getClient();
  const effectiveTimeout = timeoutMs ?? getTimeoutMs();
  const { signal, isAborted, clear } = withTimeout(effectiveTimeout);

  try {
    const response = await groq.chat.completions.create(
      {
        model: EXTRACTION_MODEL,
        messages: [{ role: 'user', content: prompt }],
        // Best-effort JSON mode. shared/validation.js's parseExtractionJson()
        // already strips markdown fences defensively, so this is not a
        // single point of failure if a specific Groq-hosted model ignores it.
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
 * Stage 2 — streaming call. Identical contract to the other adapters: emits
 * chunks via onChunk, returns full text, tags thrown errors with
 * `.streamStarted` for the orchestrator's fallback-safety check.
 */
const stream = async ({
  prompt,
  systemInstruction,
  onChunk,
  timeoutMs,
} = {}) => {
  const groq = getClient();
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
    const completionStream = await groq.chat.completions.create(
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
