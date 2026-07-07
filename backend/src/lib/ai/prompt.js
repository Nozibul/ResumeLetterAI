/**
 * @file prompt.js
 * @description Cover letter prompt builder
 * @module lib/ai/prompt
 * @author Nozibul Islam
 * @version 3.0.0
 */

const TONE_INSTRUCTIONS = {
  professional:
    'Confident, professional, and grounded — no exaggerated enthusiasm.',
  creative:
    'Engaging and distinctive in voice, but still substance-first, not gimmicky.',
  concise: 'Extremely tight, maximum 3 short paragraphs, zero filler.',
  enthusiastic:
    'Genuine energy for the role, backed by specifics — enthusiasm must be earned by evidence, not stated outright.',
  formal:
    'Traditional business letter register, but still direct and concrete.',
};

// Seniority changes WHAT the letter should emphasize, not just tone.
const SENIORITY_INSTRUCTIONS = {
  entry:
    'Candidate is entry-level/early-career. Emphasize relevant coursework, personal/academic projects, internships, and demonstrated ability to learn fast. Do not fabricate years of professional experience. It is fine to lead with a strong project instead of a job.',
  mid: 'Candidate is mid-level. Emphasize concrete project ownership, measurable delivery (features shipped, bugs reduced, performance improved), and growing technical judgment. Balance individual execution with early signs of cross-team collaboration.',
  senior:
    'Candidate is senior-level. Emphasize ownership of complex systems, architectural decisions, measurable business/technical impact, and mentorship of others. Avoid listing routine tasks — focus on judgment calls and trade-offs made.',
  lead: 'Candidate is lead/staff-level. Emphasize strategic technical judgment: which trade-off or risk they identified before others, how they influenced direction across teams, and organizational-level impact (not just code-level). Individual coding tasks should be secondary to decisions and leadership.',
};

// Phrases that make a cover letter sound generic/AI-written — explicitly banned
const BANNED_PHRASES = [
  'I am writing to apply',
  'I am thrilled to apply',
  'I have always been passionate about',
  'since I was a child',
  'dynamic team',
  'fast-paced environment',
  'proven track record',
  'leverage my skills',
  'wear many hats',
  'think outside the box',
  'go the extra mile',
  'hit the ground running',
];

/**
 * Builds the prompt sent to the AI model.
 * Kept separate so prompt changes never touch service or controller.
 *
 * @param {Object} params
 * @param {string} params.resumeText
 * @param {string} params.jobDescription
 * @param {string} params.tone - key of TONE_INSTRUCTIONS
 * @param {string} [params.seniorityLevel] - key of SENIORITY_INSTRUCTIONS (entry|mid|senior|lead)
 */
const buildCoverLetterPrompt = ({
  resumeText,
  jobDescription,
  tone,
  seniorityLevel,
}) => {
  const toneInstruction =
    TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.professional;
  const seniorityInstruction =
    SENIORITY_INSTRUCTIONS[seniorityLevel] ||
    'Infer seniority level from the resume itself (years of experience, scope of responsibility) and calibrate emphasis accordingly — entry-level candidates should lean on projects/learning agility, senior candidates should lean on ownership and impact.';

  return `You are a senior technical recruiter who has personally hired software engineers for 10+ years. You are now writing a cover letter on behalf of a candidate — one that you yourself would forward to a hiring manager without hesitation.

TONE: ${toneInstruction}

SENIORITY CALIBRATION: ${seniorityInstruction}

CANDIDATE RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

--- HOW TO THINK BEFORE WRITING ---
1. Identify the 3-5 most important requirements/keywords in the job description (skills, tech stack, domain, seniority).
2. Cross-reference them against the resume — find the STRONGEST matching evidence (specific project, metric, or outcome). Do not invent anything not present in the resume.
3. Identify what problem this company/team is likely solving (infer from the job description's responsibilities section), and connect ONE candidate achievement directly to it.
4. Apply the SENIORITY CALIBRATION above to decide what to emphasize.
5. Decide the letter's length based on how much genuinely relevant material exists — do not pad to hit a paragraph count, and do not compress strong evidence to save space.

--- STRUCTURE (3–4 paragraphs, adapt length to content, not the reverse) ---
- Paragraph 1: Open with a specific, concrete hook tied to the role or company's actual problem space — never a generic "I am writing to apply" or origin-story intro. State the role and the single strongest reason of fit in 2–3 sentences.
- Paragraph 2 (the core): One or two concrete examples in problem → action → measurable result format, weighted per the seniority calibration. Use real numbers from the resume wherever available. This paragraph carries the letter — if it's vague, the whole letter fails.
- Paragraph 3 (optional, only if there's real additional relevant evidence): A second matching point, or how the candidate's approach fits the team's way of working.
- Final paragraph: Brief, confident close with a clear call to action (e.g., availability for a conversation). No desperate or over-eager language.

--- HARD RULES ---
- Every claim must map to something actually in the resume — zero fabrication, zero inflation.
- Prioritize QUANTIFIED impact (%, time saved, scale, users, performance) over responsibility-listing. If the resume has no numbers for a point, describe the concrete outcome instead of a vague skill claim.
- Do not restate the resume as a list — synthesize, don't summarize.
- Naturally weave in 4-6 exact keywords/technologies from the job description where genuinely true of the candidate (for ATS/recruiter-search visibility) — never keyword-stuff.
- Never use these generic phrases or close paraphrases of them: ${BANNED_PHRASES.join(', ')}.
- No date, no address block, no salutation ("Dear Hiring Manager"), no sign-off name — start directly with the opening paragraph and end after the call-to-action sentence.
- Zero grammatical, spelling, or punctuation errors — this is non-negotiable.
- Sentence-level test: if a sentence could be sent unchanged to any company for any role, delete it.

Write the cover letter now — output ONLY the letter body, nothing else (no preamble, no explanation, no markdown formatting):`;
};

module.exports = {
  buildCoverLetterPrompt,
  BANNED_PHRASES,
  SENIORITY_INSTRUCTIONS,
};
