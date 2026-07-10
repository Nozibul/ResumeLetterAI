/**
 * @file gemini.js
 * @description Gemini provider adapter — "dumb" by design. Only knows how to
 * call the Gemini API (via @google/genai) and throw typed errors. Has zero
 * knowledge of Zod, retry policy, fallback, or prompt construction — all of
 * that lives in the orchestrator and shared/ modules.
 * @module lib/ai/gemini
 * @author Nozibul Islam
 * @version 4.0.0
 */

const { GoogleGenAI } = require('@google/genai');
const { getTimeoutMs } = require('./config');
const {
  classifyThrown,
  ProviderTimeoutError,
  ProviderServerError,
} = require('./errors');

const PROVIDER_NAME = 'gemini';

// Overridable via env so a future model-shutdown deadline (this exact
// scenario just happened with gemini-2.5-flash, retiring Oct 16 2026)
// never requires a code deploy to fix — just an env var change.
const EXTRACTION_MODEL =
  process.env.GEMINI_EXTRACTION_MODEL || 'gemini-3.5-flash';
const WRITER_MODEL = process.env.GEMINI_WRITER_MODEL || 'gemini-3.5-flash';

// Lazily constructed, reused across calls — avoids re-creating the client
// on every single request.
let client = null;

const getClient = () => {
  if (client) return client;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    // This should be unreachable in normal operation — config.js's
    // getProviderPriority() already excludes 'gemini' from routing if this
    // key is missing. This guard only fires if the adapter is called
    // directly (e.g. a test) bypassing the orchestrator. Not a ProviderError
    // — it's a setup/programming error, not a runtime provider failure.
    throw new Error('[gemini-adapter] GEMINI_API_KEY is not set.');
  }

  client = new GoogleGenAI({ apiKey });
  return client;
};

/**
 * Wraps a promise with a hard timeout via AbortController. The abort signal
 * is passed into the SDK call itself (config.abortSignal) so the underlying
 * HTTP request is actually cancelled, not just "given up on" locally while
 * the real request keeps running in the background wasting quota.
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

/**
 * Stage 1 — non-streaming call, expected to return JSON text.
 * Returns RAW text only. Does not parse, does not validate, does not know
 * what shape the JSON should be — that's shared/validation.js's job, called
 * by the orchestrator after this returns.
 *
 * @param {object} params
 * @param {string} params.prompt - fully-built prompt string (from prompt.js)
 * @param {number} [params.timeoutMs] - overrides the config.js default
 * @returns {Promise<string>} raw response text
 * @throws {import('./errors').ProviderError}
 */
const generate = async ({ prompt, timeoutMs } = {}) => {
  const ai = getClient();
  const effectiveTimeout = timeoutMs ?? getTimeoutMs();
  const { signal, isAborted, clear } = withTimeout(effectiveTimeout);

  try {
    const response = await ai.models.generateContent({
      model: EXTRACTION_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        abortSignal: signal,
      },
    });

    const text = response?.text;
    if (!text || !text.trim()) {
      // Empty body on a successful HTTP response — could be a safety-filter
      // block (finishReason: 'SAFETY') or an unusual empty generation.
      // Either way it's not our bug and a different provider/model may
      // succeed on the identical prompt, so this stays fallback-eligible.
      const finishReason = response?.candidates?.[0]?.finishReason;
      throw new ProviderServerError(
        PROVIDER_NAME,
        new Error(
          `Empty response body${finishReason ? ` (finishReason: ${finishReason})` : ''}`
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
 * Stage 2 — streaming call. Emits each chunk to onChunk as it arrives and
 * returns the full concatenated text once the stream completes.
 *
 * CRITICAL: if a failure happens after at least one chunk was already
 * emitted, the thrown error carries `streamStarted = true`. The orchestrator
 * uses this to enforce "pre-stream fallback only" — once true, it must
 * surface the error directly instead of trying the next provider, because
 * the client has already received partial content.
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
  const ai = getClient();
  const effectiveTimeout = timeoutMs ?? getTimeoutMs();
  const { signal, isAborted, clear } = withTimeout(effectiveTimeout);

  let streamStarted = false;
  let fullText = '';

  try {
    const response = await ai.models.generateContentStream({
      model: WRITER_MODEL,
      contents: prompt,
      config: {
        ...(systemInstruction ? { systemInstruction } : {}),
        abortSignal: signal,
      },
    });

    for await (const chunk of response) {
      const chunkText = chunk?.text;
      if (!chunkText) continue; // some chunks carry only metadata, no text delta

      streamStarted = true;
      fullText += chunkText;
      onChunk?.(chunkText);
    }

    if (!fullText.trim()) {
      // Stream completed with zero emitted text (e.g. immediate safety
      // block). streamStarted is still false here — nothing reached the
      // client — so this is safely fallback-eligible.
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
  // exported for tests / observability only — not meant for orchestrator use
  EXTRACTION_MODEL,
  WRITER_MODEL,
};
