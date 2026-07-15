/**
 * @file validation.js
 * @description Provider-agnostic schema validation for Stage-1 extraction
 * output. Any adapter's parsed JSON passes through validateExtraction()
 * after normalization — a failure here means "malformed extraction",
 * a hard violation that triggers exactly one retry (same provider).
 *
 * ALSO exports `extractionJsonSchema` — a JSON Schema derived from
 * `extractionSchema` via Zod v4's native `z.toJSONSchema()`, used by
 * gemini.js (responseJsonSchema) and groq.js (response_format json_schema)
 * for schema-constrained generation. This is a SINGLE SOURCE OF TRUTH:
 * the Zod schema is still authoritative, the JSON Schema is a derived
 * artifact, so the two can never drift out of sync.
 *
 * IMPORTANT — schema-constrained generation does NOT replace
 * validateExtraction(): `.refine()` (the VALID_CATEGORIES check on
 * capabilityGroups keys) is an arbitrary JS predicate and has no JSON
 * Schema equivalent — confirmed by testing z.toJSONSchema() directly
 * against this exact schema, which silently drops the refine and keeps
 * only the structural (record<string, string[]>) shape. Zod validation
 * therefore remains mandatory for ALL providers, not just OpenRouter
 * (which stays on JSON Mode only, per the project's provider-support
 * verification — OpenRouter's structured-output support is model-
 * dependent and can silently fall back without require_parameters:true).
 *
 * `io: 'input'` is used when deriving extractionJsonSchema specifically to
 * drop the blanket `additionalProperties: false` Zod adds by default to
 * every object level (confirmed via testing) — some providers (Gemini
 * historically) reject schemas containing that keyword. The one place
 * `additionalProperties` still legitimately appears afterward is on
 * capabilityGroups itself, where it declares the VALUE type for a
 * dynamic-key record (`{ [key: string]: string[] }`) — a different,
 * necessary use of the same JSON Schema keyword, not the "no extra keys"
 * restriction. If a live call to a provider ever rejects the schema
 * specifically because of that, the documented fallback is to drop
 * responseJsonSchema/json_schema for extraction on that provider only and
 * rely on JSON Mode + this same Zod validation, exactly like OpenRouter.
 *
 * @module lib/ai/shared/validation
 * @author Nozibul Islam
 * @version 2.0.0
 */

const { z } = require('zod');
const { VALID_CATEGORIES } = require('../prompt');

const extractionSchema = z.object({
  themeKeywords: z.array(z.string()).min(1).max(6),
  companyName: z.string().nullable().optional(),
  companyReason: z.string().nullable().optional(),
  candidateName: z.string().nullable().optional(),
  targetJobTitle: z.string().nullable().optional(),
  contactInfo: z
    .object({
      email: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      linkedin: z.string().nullable().optional(),
      github: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  candidateValue: z.string().nullable().optional(),
  honestGap: z.string().nullable().optional(),
  availabilityNote: z.string().nullable().optional(),
  stories: z.array(
    z.object({
      problem: z.string().min(1),
      action: z.string().min(1),
      result: z.string().min(1),
      company: z.string().nullable().optional(),
    })
  ),
  capabilityGroups: z
    .record(z.string(), z.array(z.string()))
    .refine(
      (obj) => Object.keys(obj).every((k) => VALID_CATEGORIES.includes(k)),
      {
        message: 'Invalid capability category',
      }
    ),
  candidateSeniorityGuess: z.enum(['entry', 'mid', 'senior', 'lead']),
});

// Computed ONCE at module load, not per-request — extractionSchema is
// static, so there's no reason to re-derive this on every call.
// See file header for why `io: 'input'` is used.
const extractionJsonSchema = z.toJSONSchema(extractionSchema, { io: 'input' });

/**
 * Wraps ZodError in a named, catchable type so the orchestrator/adapter
 * layer can identify "this failure means retry stage-1 once" without
 * inspecting Zod-specific internals or doing instanceof checks against a
 * third-party error class that could change shape across zod versions.
 */
class ExtractionValidationError extends Error {
  constructor(
    zodError,
    message = 'Stage-1 extraction output failed schema validation'
  ) {
    super(message);
    this.name = 'ExtractionValidationError';
    this.issues = zodError.issues;
    this.cause = zodError;
  }
}

const stripJsonFences = (rawText) =>
  String(rawText ?? '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

/**
 * Cleans and parses raw stage-1 text into an object. Not every provider/model
 * honors responseMimeType:'application/json' (or the new schema-constrained
 * modes) consistently — this handles the common "valid JSON wrapped in a
 * markdown fence" case regardless of source.
 * @throws {ExtractionValidationError}
 */
const parseExtractionJson = (rawText) => {
  const cleaned = stripJsonFences(rawText);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new ExtractionValidationError(
      { issues: [{ message: `Malformed JSON: ${err.message}` }] },
      'Stage-1 extraction output was not valid JSON'
    );
  }
};

/**
 * @param {object} normalized - output of extraction.normalizeExtraction()
 * @returns {object} schema-valid extraction data
 * @throws {ExtractionValidationError}
 */
const validateExtraction = (normalized) => {
  const result = extractionSchema.safeParse(normalized);
  if (!result.success) {
    throw new ExtractionValidationError(result.error);
  }
  return result.data;
};

module.exports = {
  extractionSchema,
  extractionJsonSchema,
  validateExtraction,
  ExtractionValidationError,
  parseExtractionJson,
  stripJsonFences,
};
