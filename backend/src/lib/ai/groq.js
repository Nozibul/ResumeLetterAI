/**
 * @file groq.js
 * @description Groq provider adapter — "dumb", mirrors gemini.js's and
 * openrouter.js's contract exactly (name, supportsStreaming, supportsJsonMode,
 * generate, stream).
 *
 * Stage-1 (generate) now REQUESTS schema-constrained generation via
 * response_format: {type:'json_schema', json_schema:{name, schema}} --
 * `strict: true` is deliberately OMITTED. Groq's strict mode requires
 * every field to be in `required` and every object to set
 * `additionalProperties: false`; shared/validation.js's extractionJsonSchema
 * is deliberately derived WITHOUT additionalProperties (for Gemini
 * compatibility) and keeps genuinely-optional fields optional, so it does
 * not meet strict mode's structural requirements. This exact
 * non-strict shape (name + schema only) matches Groq's own official
 * documentation example for using z.toJSONSchema() output directly.
 *
 * Community-reported compatibility issue exists (Groq forum, Oct 2025):
 * response_format:'json_schema' may be silently ignored by
 * openai/gpt-oss-120b (our configured default model), returning free-form
 * text instead of conforming JSON. Unconfirmed whether still current.
 * Schema mode stays ENABLED here regardless (best-effort, not a
 * requirement) -- Zod validation + retry + fallback in the orchestrator is
 * the authoritative safety net either way: if the model ignores the
 * schema, parseExtractionJson() fails to parse the free-form text,
 * correctly raises ExtractionValidationError, and the orchestrator retries
 * once then falls back to the next provider. Worst case is "no benefit
 * from schema mode on Groq specifically", not a broken request.
 *
 * Stage-2 (stream) is unaffected -- free-form prose, no schema applies.
 *
 * @module lib/ai/groq
 * @author Nozibul Islam
 * @version 2.0.0
 */

const Groq = require('groq-sdk');
const { getTimeoutMs } = require('./config');
const {
  classifyThrown,
  ProviderTimeoutError,
  ProviderServerError,
} = require('./errors');
const { extractionJsonSchema } = require('./shared/validation');

const PROVIDER_NAME = 'groq';

// Overridable via env, same pattern as gemini.js / openrouter.js.
// NOTE: llama-3.3-70b-versatile is deprecated by Groq, shutdown 08/16/2026 --
// using openai/gpt-oss-120b instead (Groq's own recommended replacement).
const EXTRACTION_MODEL =
  process.env.GROQ_EXTRACTION_MODEL || 'openai/gpt-oss-120b';
const WRITER_MODEL = process.env.GROQ_WRITER_MODEL || 'openai/gpt-oss-120b';

let client = null;

const getClient = () => {
  if (client) return client;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('[groq-adapter] GROQ_API_KEY is not set.');
  }

  client = new Groq({
    apiKey,
    maxRetries: 0,
  });
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

const isAbortLike = (err) =>
  err?.name === 'AbortError' ||
  err?.name === 'APIUserAbortError' ||
  err?.name === 'APIConnectionTimeoutError';

/**
 * Stage 1 — non-streaming call, schema-constrained (best-effort, non-strict)
 * JSON generation. Returns RAW text only.
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
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'cover_letter_extraction',
            schema: extractionJsonSchema,
          },
        },
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
 * Stage 2 — streaming call. Free-form prose, no schema constraint applies.
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
