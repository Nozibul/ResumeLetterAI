/**
 * @file extraction.js
 * @description Provider-agnostic normalization for Stage-1 (extraction) output.
 * Runs BEFORE schema validation — fixes what it can (aliases), silently drops
 * what it can't map, and never throws. Any adapter (Gemini/OpenRouter/Groq)
 * feeds its raw parsed JSON through this before validation.js sees it.
 * @module lib/ai/shared/extraction
 * @author Nozibul Islam
 * @version 1.0.0
 */

const {
  MAX_STORIES,
  MAX_CAPABILITY_CATEGORIES,
  MAX_ITEMS_PER_CATEGORY,
} = require('../prompt');

const CATEGORY_ALIASES = {
  frontend: 'frontend',
  'front-end': 'frontend',
  'front end': 'frontend',
  ui: 'frontend',
  backend: 'backend',
  'back-end': 'backend',
  'back end': 'backend',
  server: 'backend',
  api: 'backend',
  database: 'database',
  databases: 'database',
  db: 'database',
  testing: 'testing',
  test: 'testing',
  qa: 'testing',
  'quality assurance': 'testing',
  deployment: 'deployment',
  devops: 'deployment',
  deploy: 'deployment',
  'ci/cd': 'deployment',
  cloud: 'deployment',
  other: 'other',
  tools: 'other',
  general: 'other',
  methodology: 'other',
  methodologies: 'other',
  'problem solving': 'other',
  'problem-solving': 'other',
  concepts: 'other',
};

const SENIORITY_ALIASES = {
  entry: 'entry',
  junior: 'entry',
  'entry-level': 'entry',
  beginner: 'entry',
  mid: 'mid',
  'mid-level': 'mid',
  middle: 'mid',
  intermediate: 'mid',
  experienced: 'mid',
  senior: 'senior',
  'senior-level': 'senior',
  sr: 'senior',
  lead: 'lead',
  staff: 'lead',
  principal: 'lead',
};

/** Unknown category → null (dropped upstream, never rejected here). */
const normalizeCategory = (raw) => {
  const key = String(raw ?? '')
    .trim()
    .toLowerCase();
  return CATEGORY_ALIASES[key] || null;
};

/** Unknown seniority → 'mid' (safe default), never blocks the pipeline. */
const normalizeSeniority = (raw) => {
  const key = String(raw ?? '')
    .trim()
    .toLowerCase();
  return SENIORITY_ALIASES[key] || 'mid';
};

/**
 * Guards against a model returning capabilityGroups as a string, array, or
 * null instead of an object — Object.entries() on a string silently iterates
 * characters, which would corrupt output without ever throwing. Only a true
 * plain object is treated as a category map; anything else safely becomes {}.
 */
const asCategoryMap = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const toNonEmptyString = (value) =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

/**
 * Runs BEFORE Zod validation. Normalizes category names and seniority via
 * alias maps, merges items from aliased categories together (e.g. "frontend"
 * + "ui" both collapse into "frontend"), and drops anything unmappable
 * instead of failing the whole extraction over one bad field.
 */
const normalizeExtraction = (raw = {}) => {
  const mergedGroups = {};
  const groupsInput = asCategoryMap(raw.capabilityGroups);

  for (const [category, items] of Object.entries(groupsInput)) {
    const normalized = normalizeCategory(category);
    if (!normalized || !Array.isArray(items)) continue;

    const cleanItems = items.map(toNonEmptyString).filter(Boolean);
    if (cleanItems.length === 0) continue;

    mergedGroups[normalized] = [
      ...(mergedGroups[normalized] || []),
      ...cleanItems,
    ];
  }

  return {
    ...raw,
    capabilityGroups: mergedGroups,
    candidateSeniorityGuess: normalizeSeniority(raw.candidateSeniorityGuess),
  };
};

/**
 * Runs AFTER Zod validation (parsed is already schema-valid at this point).
 * Enforces the hard caps from prompt.js so a model that ignores "at most N"
 * instructions can't blow past the prompt's own limits.
 */
const trimExtraction = (parsed) => {
  const trimmedGroups = Object.fromEntries(
    Object.entries(parsed.capabilityGroups)
      .slice(0, MAX_CAPABILITY_CATEGORIES)
      .map(([category, items]) => [
        category,
        items.slice(0, MAX_ITEMS_PER_CATEGORY),
      ])
  );

  return {
    ...parsed,
    stories: (parsed.stories || []).slice(0, MAX_STORIES),
    capabilityGroups: trimmedGroups,
  };
};

/**
 * "a | b | c" from whichever contact fields exist — never invents a field.
 * Guards against non-string values (a model could return a number for
 * "phone", or an object) which would otherwise produce "[object Object]"
 * in the final letter header.
 */
const buildContactLine = (contactInfo) => {
  if (!contactInfo || typeof contactInfo !== 'object') return null;

  const parts = [
    contactInfo.email,
    contactInfo.phone,
    contactInfo.linkedin,
    contactInfo.github,
  ]
    .map(toNonEmptyString)
    .filter(Boolean);

  return parts.length ? parts.join(' | ') : null;
};

module.exports = {
  CATEGORY_ALIASES,
  SENIORITY_ALIASES,
  normalizeCategory,
  normalizeSeniority,
  normalizeExtraction,
  trimExtraction,
  buildContactLine,
};
