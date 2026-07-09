/**
 * @file gemini.js
 * @description Gemini AI provider implementation — two-stage pipeline
 * @module lib/ai/gemini
 * @author Nozibul Islam
 * @version 3.0.0
 */

const { z } = require('zod');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
  buildMatchExtractionPrompt,
  buildCoverLetterPrompt,
  buildOpeningBlock,
  buildClosingBlock,
  wrapAsLetter,
  BANNED_SENTENCE_STARTERS,
  VALID_CATEGORIES,
  MAX_STORIES,
  MAX_CAPABILITY_CATEGORIES,
  MAX_ITEMS_PER_CATEGORY,
} = require('./prompt');
const AppError = require('../../shared/utils/AppError');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ============================================================
// NORMALIZATION — maps common LLM output variations to our exact
// enum values BEFORE Zod sees them.
// ============================================================

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

/** Unknown category → null (dropped), not rejected. */
const normalizeCategory = (raw) => {
  const key = String(raw || '')
    .trim()
    .toLowerCase();
  return CATEGORY_ALIASES[key] || null;
};

/** Unknown seniority → 'mid' (safe default), never blocks the pipeline. */
const normalizeSeniority = (raw) => {
  const key = String(raw || '')
    .trim()
    .toLowerCase();
  return SENIORITY_ALIASES[key] || 'mid';
};

/**
 * Runs BEFORE Zod validation. Fixes what it can (aliases), drops what it
 * can't map (unknown category → discarded, not fatal), and always returns
 * a shape Zod should accept.
 */
const normalizeExtraction = (raw) => {
  const mergedGroups = {};

  for (const [category, items] of Object.entries(raw.capabilityGroups || {})) {
    const normalized = normalizeCategory(category);
    if (!normalized || !Array.isArray(items) || items.length === 0) continue;
    mergedGroups[normalized] = [...(mergedGroups[normalized] || []), ...items];
  }

  return {
    ...raw,
    capabilityGroups: mergedGroups,
    candidateSeniorityGuess: normalizeSeniority(raw.candidateSeniorityGuess),
  };
};

// ============================================================
// SCHEMA
// ============================================================

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
      { message: 'Invalid capability category' }
    ),
  candidateSeniorityGuess: z.enum(['entry', 'mid', 'senior', 'lead']),
});

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
    stories: parsed.stories.slice(0, MAX_STORIES),
    capabilityGroups: trimmedGroups,
  };
};

const runExtraction = async ({ resumeText, jobDescription }) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = buildMatchExtractionPrompt({ resumeText, jobDescription });
  const result = await model.generateContent(prompt);
  const cleaned = result.response
    .text()
    .replace(/```json|```/g, '')
    .trim();

  console.log('[cover-letter] raw stage1 response:', cleaned);

  return JSON.parse(cleaned); // throws on malformed JSON — caught by caller
};

const extractMatches = async ({ resumeText, jobDescription }) => {
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await runExtraction({ resumeText, jobDescription });
      const normalized = normalizeExtraction(raw);
      const parsed = extractionSchema.parse(normalized);
      const trimmed = trimExtraction(parsed);

      const hasStories = trimmed.stories.length > 0;
      const hasCapabilities = Object.values(trimmed.capabilityGroups).some(
        (items) => items.length > 0
      );

      if (!hasStories && !hasCapabilities) {
        throw new AppError(
          'No strong matches found between resume and job description.',
          502
        );
      }

      return trimmed;
    } catch (err) {
      lastError = err;
      console.warn(
        `[cover-letter] extraction attempt ${attempt} failed:`,
        err.message
      );

      // Rate limit — retrying immediately won't help, don't burn the 2nd attempt
      if (
        err.message?.includes('429') ||
        err.message?.includes('Too Many Requests')
      ) {
        throw new AppError(
          'AI service is temporarily rate-limited. Please try again in a minute, or later today.',
          503
        );
      }
    }
  }

  console.error(
    '[cover-letter] extraction failed after retry:',
    lastError?.message
  );
  throw new AppError(
    'AI could not analyze the resume against this job description. Please try again.',
    502
  );
};

const warnIfBannedStarterPresent = (text) => {
  const hit = text
    .split('\n')
    .find((line) =>
      BANNED_SENTENCE_STARTERS.some((phrase) => line.trim().startsWith(phrase))
    );
  if (hit) {
    console.warn(
      '[cover-letter] banned sentence starter detected:',
      hit.trim()
    );
  }
};

/**
 * "a | b | c" from whichever contact fields exist — never invents a field.
 * Extraction already filters out placeholder labels (e.g. the literal word
 * "Linkedin" with no URL) before this ever runs, so anything present here
 * is assumed to be a real value.
 */
const buildContactLine = (contactInfo) => {
  if (!contactInfo) return null;
  const parts = [
    contactInfo.email,
    contactInfo.phone,
    contactInfo.linkedin,
    contactInfo.github,
  ].filter(Boolean);
  return parts.length ? parts.join(' | ') : null;
};

/**
 * Generates a complete, ready-to-send cover letter.
 *
 * accountFallbackName flows in from the authenticated user (req.user.fullName),
 * used ONLY when the resume itself doesn't yield a clear name — the resume's
 * candidateName always takes priority, since the account owner and the
 * resume's subject can be different people.
 *
 * The date/greeting/subject/signature/contact-header are NEVER generated by
 * the model — they're applied deterministically via buildOpeningBlock() /
 * buildClosingBlock() (from prompt.js), streamed as fixed chunks before/after
 * the model's tokens, and reused unchanged for the persisted DB copy via
 * wrapAsLetter(). This guarantees the streamed letter and the saved letter
 * are always identical, regardless of what the model does with the body.
 *
 * honestGap is extracted in stage 1 and threaded through to stage 2 for
 * potential future use (e.g. a separate "skill gap" UI feature), but by
 * design it is NEVER surfaced in the letter body itself — see prompt.js.
 */
const generateWithGemini = async ({
  resumeText,
  jobDescription,
  tone,
  seniorityLevel,
  accountFallbackName,
  onChunk,
  onStage,
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError('AI service is not configured', 503);
  }

  onStage?.('analyzing');
  const stage1Start = Date.now();

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
  } = await extractMatches({ resumeText, jobDescription });

  console.log(
    `[cover-letter] stage1 (extraction) took ${Date.now() - stage1Start}ms`
  );

  // Resume-extracted name wins; account name is only a fallback.
  const finalName = extractedName || accountFallbackName || null;
  const contactLine = buildContactLine(contactInfo);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `
You write the BODY of a first-person cover letter only.
Never write recruiter summaries. Never recommend the candidate. Never write in third person.
Never write a date, a salutation ("Dear ..."), a "Subject:" line, or a signature ("Sincerely," etc.) —
those are added separately by the application. Output only the four body paragraphs.
`,
  });

  const prompt = buildCoverLetterPrompt({
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

  onStage?.('writing');
  const stage2Start = Date.now();

  // Fixed opening block (contact header, date, subject, greeting) — sent
  // BEFORE the model's first token. Note: no candidateName here — the
  // name appears exactly once, in the closing signature block.
  const openingBlock = buildOpeningBlock({
    contactLine,
    targetJobTitle,
    companyName,
  });

  if (onChunk) onChunk(openingBlock);

  const result = await model.generateContentStream(prompt);

  let fullBody = '';
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullBody += chunkText;
    if (onChunk) onChunk(chunkText);
  }

  console.log(
    `[cover-letter] stage2 (writing) took ${Date.now() - stage2Start}ms`
  );

  if (!fullBody.trim()) {
    throw new AppError('AI returned empty response', 502);
  }

  warnIfBannedStarterPresent(fullBody);

  // Fixed closing block (signature) — sent LAST, after the model's final token.
  const closingBlock = buildClosingBlock({ candidateName: finalName });
  if (onChunk) onChunk(closingBlock);

  // Persisted DB content mirrors exactly what the client streamed —
  // built via the same buildOpeningBlock/buildClosingBlock (through
  // wrapAsLetter), so DB content and streamed content can never drift.
  const fullContent = wrapAsLetter({
    body: fullBody,
    companyName,
    candidateName: finalName,
    contactLine,
    targetJobTitle,
  });

  return fullContent;
};

module.exports = { generateWithGemini };
