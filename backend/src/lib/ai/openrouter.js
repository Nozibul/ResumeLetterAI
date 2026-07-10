/**
 * @file openrouter.js
 * @description OpenRouter provider adapter — "dumb" by design, mirrors
 * gemini.js's contract (generate/stream, typed errors, streamStarted flag)
 * exactly so the orchestrator treats every adapter identically. Uses raw
 * fetch rather than a new SDK dependency -- OpenRouter's REST API is
 * OpenAI-compatible JSON/SSE, simple enough not to need one.
 * @module lib/ai/openrouter
 * @author Nozibul Islam
 * @version 1.0.0
 */

const { getTimeoutMs } = require('./config');
const {
  classifyThrown,
  classifyByStatusCode,
  ProviderTimeoutError,
  ProviderServerError,
} = require('./errors');

const PROVIDER_NAME = 'openrouter';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Overridable via env -- OpenRouter's FREE model catalog rotates especially
// often (models move to paid or get retired without much notice -- this
// happened to DeepSeek's and Qwen3 Coder's free tiers already). Verify at
// openrouter.ai/models (filter: Price = Free) before deploying.
//
// meta-llama/llama-3.3-70b-instruct:free chosen deliberately over the
// several free *coding*-agent models currently listed (Poolside Laguna,
// Cohere North Mini Code, Qwen3 Coder) -- those are tuned for tool-use/code
// generation, not general prose writing, which is what both our stages
// actually need (structured JSON extraction, then natural cover-letter text).
//
// IMPORTANT: free-tier OpenRouter models are capped around 20 req/min and
// ~50-200 req/day (varies with account credit history). Unlike Gemini's
// paid-tier headroom, this limit is a routine operating condition here, not
// a rare edge case -- relevant once the circuit breaker (step 12) is built.
const EXTRACTION_MODEL =
  process.env.OPENROUTER_EXTRACTION_MODEL ||
  'meta-llama/llama-3.3-70b-instruct:free';
const WRITER_MODEL =
  process.env.OPENROUTER_WRITER_MODEL ||
  'meta-llama/llama-3.3-70b-instruct:free';

// Optional, purely for OpenRouter's own app-attribution/rankings -- never
// required for the API call to function, so a missing env var is fine.
const APP_TITLE = process.env.OPENROUTER_APP_TITLE || null;
const APP_REFERER = process.env.OPENROUTER_APP_URL || null;

const getApiKey = () => {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || !key.trim()) {
    // Unreachable in normal operation -- config.js already excludes
    // 'openrouter' from routing if this is missing. Guards direct/test calls.
    throw new Error('[openrouter-adapter] OPENROUTER_API_KEY is not set.');
  }
  return key;
};

const buildHeaders = () => {
  const headers = {
    Authorization: `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
  };
  if (APP_REFERER) headers['HTTP-Referer'] = APP_REFERER;
  if (APP_TITLE) headers['X-Title'] = APP_TITLE;
  return headers;
};

const withTimeout = (timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    isAborted: () => controller.signal.aborted,
    clear: () => clearTimeout(timer),
  };
};

/**
 * Minimal OpenAI-compatible SSE line reader. Yields parsed JSON payloads,
 * skips [DONE] and keep-alive/blank lines. Node's built-in fetch exposes
 * response.body as a web ReadableStream, so this reads it directly rather
 * than pulling in a separate SSE-parsing dependency for one adapter.
 */
async function* iterateSseLines(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // keep the last, possibly-incomplete line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') return;

        try {
          yield JSON.parse(payload);
        } catch {
          // A single malformed SSE frame (stray heartbeat/comment) shouldn't
          // kill the whole stream -- skip it and keep reading.
          continue;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Stage 1 — non-streaming call, expected to return JSON text.
 * Returns RAW text only -- no parsing/validation, same contract as
 * gemini.js's generate().
 *
 * @param {object} params
 * @param {string} params.prompt
 * @param {number} [params.timeoutMs]
 * @returns {Promise<string>} raw response text
 * @throws {import('./errors').ProviderError}
 */
const generate = async ({ prompt, timeoutMs } = {}) => {
  const effectiveTimeout = timeoutMs ?? getTimeoutMs();
  const { signal, isAborted, clear } = withTimeout(effectiveTimeout);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: buildHeaders(),
      signal,
      body: JSON.stringify({
        model: EXTRACTION_MODEL,
        messages: [{ role: 'user', content: prompt }],
        // Not all OpenRouter-hosted models honor this consistently -- the
        // shared parseExtractionJson() fence-stripping + retry-on-malformed
        // path already covers a model that ignores it, so no adapter-level
        // special-casing is needed here.
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => '');
      throw classifyByStatusCode(
        PROVIDER_NAME,
        response.status,
        new Error(bodyText || response.statusText)
      );
    }

    const json = await response.json();
    const text = json?.choices?.[0]?.message?.content;

    if (!text || !text.trim()) {
      const finishReason = json?.choices?.[0]?.finish_reason;
      throw new ProviderServerError(
        PROVIDER_NAME,
        new Error(
          `Empty response body${finishReason ? ` (finish_reason: ${finishReason})` : ''}`
        )
      );
    }

    return text;
  } catch (err) {
    if (isAborted() || err?.name === 'AbortError') {
      throw new ProviderTimeoutError(PROVIDER_NAME, err, effectiveTimeout);
    }
    throw classifyThrown(PROVIDER_NAME, err);
  } finally {
    clear();
  }
};

/**
 * Stage 2 — streaming call. Emits each delta to onChunk as it arrives and
 * returns the full concatenated text once the stream completes. Same
 * `streamStarted`-tagging contract as gemini.js's stream().
 *
 * @param {object} params
 * @param {string} params.prompt
 * @param {string} [params.systemInstruction]
 * @param {(chunkText: string) => void} [params.onChunk]
 * @param {number} [params.timeoutMs]
 * @returns {Promise<string>} full concatenated body text
 * @throws {import('./errors').ProviderError} with an added `.streamStarted` boolean
 */
const stream = async ({
  prompt,
  systemInstruction,
  onChunk,
  timeoutMs,
} = {}) => {
  const effectiveTimeout = timeoutMs ?? getTimeoutMs();
  const { signal, isAborted, clear } = withTimeout(effectiveTimeout);

  const messages = systemInstruction
    ? [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ]
    : [{ role: 'user', content: prompt }];

  let streamStarted = false;
  let fullText = '';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: buildHeaders(),
      signal,
      body: JSON.stringify({ model: WRITER_MODEL, messages, stream: true }),
    });

    if (!response.ok) {
      // Per OpenRouter's own docs: an error before any tokens stream still
      // returns a normal JSON error body with the right status -- safe to
      // classify by status code exactly like the non-streaming path.
      const bodyText = await response.text().catch(() => '');
      throw classifyByStatusCode(
        PROVIDER_NAME,
        response.status,
        new Error(bodyText || response.statusText)
      );
    }

    for await (const event of iterateSseLines(response.body)) {
      const deltaText = event?.choices?.[0]?.delta?.content;
      if (!deltaText) continue; // some frames carry only metadata, no text delta

      streamStarted = true;
      fullText += deltaText;
      onChunk?.(deltaText);
    }

    if (!fullText.trim()) {
      // Nothing meaningful streamed -- streamStarted is still false here,
      // so this stays safely fallback-eligible.
      throw new ProviderServerError(
        PROVIDER_NAME,
        new Error('Empty stream output')
      );
    }

    return fullText;
  } catch (err) {
    const typed =
      isAborted() || err?.name === 'AbortError'
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
  // exported for tests / observability only
  EXTRACTION_MODEL,
  WRITER_MODEL,
};
