/**
 * @file gemini.js
 * @description Gemini provider adapter — "dumb", mirrors openrouter.js's/
 * groq.js's contract exactly (name, supportsStreaming, supportsJsonMode,
 * generate, stream).
 *
 * Stage-1 (generate) now uses SCHEMA-CONSTRAINED generation, not just JSON
 * Mode: responseJsonSchema (verified present in @google/genai's
 * GenerateContentConfig interface) is passed alongside responseMimeType,
 * built from shared/validation.js's extractionJsonSchema — itself derived
 * from the same Zod extractionSchema that validateExtraction() still
 * unconditionally enforces afterward. Schema-constrained generation
 * guarantees SHAPE (types, required fields, enums), not business rules
 * like the VALID_CATEGORIES .refine() (confirmed to have no JSON Schema
 * equivalent) — Zod validation is not optional, not redundant, it's the
 * only thing enforcing that specific rule.
 *
 * If a live call ever rejects this schema (historically, some Gemini
 * schema modes disallowed `additionalProperties` — mitigated here via
 * `io:'input'` when deriving extractionJsonSchema, but not 100%
 * guaranteed without a live test), the fallback is to drop
 * responseJsonSchema from generate() below and rely on JSON Mode + Zod
 * only, exactly like openrouter.js already does.
 *
 * Stage-2 (stream) is unaffected -- free-form prose, no schema applies.
 *
 * @module lib/ai/gemini
 * @author Nozibul Islam
 * @version 5.0.0
 */

const { GoogleGenAI } = require('@google/genai');
const { getTimeoutMs } = require('./config');
const {
  classifyThrown,
  ProviderTimeoutError,
  ProviderServerError,
} = require('./errors');
const { extractionJsonSchema } = require('./shared/validation');

const PROVIDER_NAME = 'gemini';

// Overridable via env so a future model-shutdown deadline (this exact
// scenario already happened once with gemini-2.5-flash, retired Oct 2026)
// never requires a code deploy to fix -- just an env var change.
const EXTRACTION_MODEL =
  process.env.GEMINI_EXTRACTION_MODEL || 'gemini-3.5-flash';
const WRITER_MODEL = process.env.GEMINI_WRITER_MODEL || 'gemini-3.5-flash';

let client = null;

const getClient = () => {
  if (client) return client;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('[gemini-adapter] GEMINI_API_KEY is not set.');
  }

  client = new GoogleGenAI({ apiKey });
  return client;
};

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
 * Stage 1 — non-streaming call, schema-constrained JSON generation.
 * Returns RAW text only.
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
        responseJsonSchema: extractionJsonSchema,
        abortSignal: signal,
      },
    });

    const text = response?.text;
    if (!text || !text.trim()) {
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
 * Stage 2 — streaming call. Free-form prose, no schema constraint applies.
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
      if (!chunkText) continue;

      streamStarted = true;
      fullText += chunkText;
      onChunk?.(chunkText);
    }

    if (!fullText.trim()) {
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
  EXTRACTION_MODEL,
  WRITER_MODEL,
};
