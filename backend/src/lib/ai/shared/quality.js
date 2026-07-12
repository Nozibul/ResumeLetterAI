/**
 * @file quality.js
 * @description Post-generation quality checks for Stage-2 (cover letter body)
 * output, and the Stage-1 "did we actually find a match" business check.
 *
 * Tiered by design:
 *   HARD violation  -> logged loudly, delivered as-is (see orchestrator.js
 *                       header for why this is NOT retried).
 *   SOFT violation  -> log only, never blocks delivery to the user.
 *
 * @module lib/ai/shared/quality
 * @author Nozibul Islam
 * @version 1.0.0
 */

const {
  MIN_WORDS,
  MAX_WORDS,
  BANNED_PHRASES,
  BANNED_SENTENCE_STARTERS,
  EXPECTED_PARAGRAPH_COUNT,
} = require('../prompt');

// Word-boundary-anchored, deliberately conservative. A false negative here
// just means one soft-quality issue slips through unflagged; a false
// positive triggers an unnecessary retry — so patterns stay specific
// rather than broad ("i cannot" alone would be far too aggressive).
const AI_DISCLAIMER_PATTERNS = [
  /\bas an ai\b/i,
  /\bi am an ai\b/i,
  /\bi'm an ai\b/i,
  /\bas a large language model\b/i,
  /\bas an ai language model\b/i,
  /\bi do not have (personal|the ability)\b/i,
  /\bi don't have (personal|the ability)\b/i,
  /\bi cannot (assist|help|fulfill|provide|generate) (with )?this\b/i,
  /\bi'm unable to (assist|help|generate|provide)\b/i,
];

const normalizeLineEndings = (text) => text.replace(/\r\n/g, '\n');

const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;

const splitParagraphs = (text) =>
  normalizeLineEndings(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

const findBannedPhrases = (text) => {
  const lower = text.toLowerCase();
  return BANNED_PHRASES.filter((phrase) =>
    lower.includes(phrase.toLowerCase())
  );
};

const findBannedStarters = (text) => {
  const hits = [];
  for (const line of normalizeLineEndings(text).split('\n')) {
    const trimmed = line.trim();
    const starter = BANNED_SENTENCE_STARTERS.find((phrase) =>
      trimmed.startsWith(phrase)
    );
    if (starter) hits.push(starter);
  }
  return hits;
};

const findAiDisclaimer = (text) =>
  AI_DISCLAIMER_PATTERNS.some((p) => p.test(text));

/**
 * @param {string} bodyText - raw model output (body only, before scaffolding)
 * @param {object} [options]
 * @param {string} [options.tone] - 'concise' relaxes the MIN_WORDS floor only,
 *   matching prompt.js's own instruction that concise letters may run shorter.
 *   The MAX_WORDS ceiling still applies regardless of tone.
 * @returns {{ hard: Array<{type:string, detail?:string}>, soft: Array<{type:string, detail?:string}> }}
 */
const checkLetterQuality = (bodyText, { tone } = {}) => {
  const hard = [];
  const soft = [];
  const trimmed = typeof bodyText === 'string' ? bodyText.trim() : '';

  if (!trimmed) {
    hard.push({ type: 'empty_output' });
    return { hard, soft }; // nothing else is meaningfully checkable on empty text
  }

  const paragraphs = splitParagraphs(trimmed);
  if (paragraphs.length !== EXPECTED_PARAGRAPH_COUNT) {
    hard.push({
      type: 'wrong_paragraph_count',
      detail: `expected ${EXPECTED_PARAGRAPH_COUNT}, got ${paragraphs.length}`,
    });
  }

  if (findAiDisclaimer(trimmed)) {
    hard.push({ type: 'ai_disclaimer' });
  }

  const wordCount = countWords(trimmed);
  const isConcise = tone === 'concise';
  if (wordCount > MAX_WORDS) {
    soft.push({
      type: 'word_count_out_of_range',
      detail: `${wordCount} words (max ${MAX_WORDS})`,
    });
  } else if (!isConcise && wordCount < MIN_WORDS) {
    soft.push({
      type: 'word_count_out_of_range',
      detail: `${wordCount} words (min ${MIN_WORDS})`,
    });
  }

  const bannedHits = findBannedPhrases(trimmed);
  if (bannedHits.length > 0) {
    soft.push({ type: 'banned_phrase', detail: bannedHits.join('; ') });
  }

  const starterHits = findBannedStarters(trimmed);
  if (starterHits.length > 0) {
    soft.push({ type: 'banned_starter', detail: starterHits.join('; ') });
  }

  return { hard, soft };
};

/**
 * Stage-1 business check (not a technical/schema failure) — is there
 * actually a genuine resume↔JD match? Moved here unchanged from gemini.js,
 * now provider-agnostic.
 */
const hasUsableExtraction = (trimmed) => {
  const hasStories = (trimmed.stories || []).length > 0;
  const hasCapabilities = Object.values(trimmed.capabilityGroups || {}).some(
    (items) => items.length > 0
  );
  return hasStories || hasCapabilities;
};

/**
 * Thrown when hasUsableExtraction() is false — valid, schema-correct JSON,
 * but no genuine overlap between resume and job description.
 *
 * This is a BUSINESS outcome, not a technical failure — matching is a
 * judgment call, not a deterministic fact-check, so a different provider's
 * model may reach a different conclusion on the identical input. The
 * orchestrator therefore treats this as "try the next provider", not an
 * immediate stop — but never retries the SAME provider with identical
 * input, since that would be a deterministic repeat of the same judgment.
 */
class NoUsableMatchError extends Error {
  constructor() {
    super('No strong matches found between resume and job description.');
    this.name = 'NoUsableMatchError';
  }
}

module.exports = {
  checkLetterQuality,
  hasUsableExtraction,
  NoUsableMatchError,
  countWords,
  splitParagraphs,
  findBannedPhrases,
  findBannedStarters,
  findAiDisclaimer,
  AI_DISCLAIMER_PATTERNS,
};
