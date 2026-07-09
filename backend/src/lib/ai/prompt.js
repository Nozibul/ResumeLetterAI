/**
 * @file prompt.js
 * @description Cover letter prompt builder (two-stage, v3.0.0 — narrative-first, gap-silent)
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

const SENIORITY_INSTRUCTIONS = {
  entry:
    'Candidate is entry-level/early-career. Emphasize coursework, personal/academic projects, internships, and fast learning. Do not fabricate years of professional experience.',
  mid: 'Candidate is mid-level. Emphasize concrete project ownership, measurable delivery, and growing technical judgment.',
  senior:
    'Candidate is senior-level. Emphasize ownership of complex systems, architectural decisions, measurable impact, mentorship.',
  lead: 'Candidate is lead/staff-level. Emphasize strategic technical judgment and organizational-level impact over individual coding tasks.',
};

const BANNED_PHRASES = [
  'I am writing to apply',
  'I am submitting my background',
  'I have always been passionate about',
  'since I was a child',
  'directly aligns with',
  'align directly with',
  'demonstrates my ability',
  'showcasing my ability',
  'track record',
  'technical depth',
  'available to discuss my qualifications',
  'at your convenience',
  'I look forward to hearing from you',
  'fast-paced environment',
  'I am confident that',
  'I am confident my',
  'eager to gain',
  'eager to learn',
  'hoping to learn',
  'willing to learn',
  'I am eager',
  'happy to jump on a call',
  'jump on a call',
];

const BANNED_SENTENCE_STARTERS = [
  'Furthermore,',
  'In addition,',
  'I also',
  'I have also',
  'Moreover,',
  'Additionally,',
  'For one project,',
  'In another instance,',
  'In one instance,',
  'On one occasion,',
];

// v3.0.0: no separate "soft_skills" category. Collaboration/communication
// evidence is folded directly into stories (where it reads as a real
// moment) instead of becoming its own bullet-like category — this avoids
// forcing every letter to have a dedicated "soft skills" sentence.
const VALID_CATEGORIES = [
  'frontend',
  'backend',
  'database',
  'testing',
  'deployment',
  'other', // achievements/credibility markers: LeetCode, education, certifications, CP
];

const MAX_STORIES = 2;
const MAX_CAPABILITY_CATEGORIES = 3;
const MAX_ITEMS_PER_CATEGORY = 3;
const MIN_WORDS = 230;
const MAX_WORDS = 380;
const EXPECTED_PARAGRAPH_COUNT = 4;

// ============================================================
// STAGE 1 — extraction
// ============================================================

const buildMatchExtractionPrompt = ({ resumeText, jobDescription }) => {
  return `You are analyzing a resume against a job description. Do NOT write any letter text — only extract and categorize.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

TASK:
1. Find genuine overlaps between the resume and the JD — skip anything the resume doesn't truly support.
2. "stories": AT MOST ${MAX_STORIES} items with a real problem→action→measurable result (numbers, %, time, scale). Pick only the strongest. Never invent a "problem" if none exists.
   - If the resume names the employer/company where this happened, include it as "company" — otherwise use null.
   - Never invent an ownership descriptor (e.g. "independently," "solo," "led the team") that isn't explicitly stated or clearly implied by the resume's own section structure. If the resume doesn't say who else was involved, leave it unstated rather than guessing either way.
   - If the resume mentions collaborating with other roles (designers, backend devs, PMs, QA) as part of achieving this result, include that detail in "action" — this is how collaboration evidence gets captured, not as a separate category.
3. "capabilityGroups": AT MOST ${MAX_CAPABILITY_CATEGORIES} categories total, each with AT MOST ${MAX_ITEMS_PER_CATEGORY} items, from: ${VALID_CATEGORIES.join(', ')}.
   - Prioritize ONLY the categories the JD directly emphasizes. Do not include a category just because the resume has it — relevance to THIS job description is the filter.
   - The "other" category may ALSO include general credibility markers not literally named in the JD but that strengthen the candidate's case — e.g. competitive programming stats, relevant degree, certifications. Include at most 1 such item even if the JD never mentions them.
   - Each item is a short plain fact (3-6 words), not a full sentence.
   - It is better to select fewer, stronger categories/items than to maximize coverage. Leaving out a true fact is preferable to turning the letter into a resume summary.
4. Paraphrase everything in your own words — never copy resume sentences verbatim.
5. "themeKeywords": 2-3 short keywords, directly traceable to a specific story or capability above — never generic language like "dynamic environment" or "tangible business gains."
6. "companyReason": if the job description gives ANY concrete detail about the company beyond its name (product, mission line, tech stack, team structure, a stated value, culture, growth stage) that the candidate could genuinely reference, extract it as a short plain phrase. If the JD gives nothing concrete beyond generic corporate language, return null — never fabricate a reason to sound personalized.
7. "companyName": if the job description explicitly names the hiring company, extract it exactly as written. If it doesn't, return null — never guess.
8. "candidateName": extract the candidate's full name from the resume text itself (usually at the top). If no clear name is found, return null — never guess.
9. "targetJobTitle": extract the specific job title being hired for from the job description (e.g. "Frontend Engineer", "Senior Backend Developer"). If the JD doesn't clearly state one, return null.
10. "contactInfo": extract email, phone, linkedin, and github ONLY if literally present in the resume text AND is an actual value (a real URL or handle) — not a placeholder label like the word "Linkedin" or "Github" with no link attached. Each is null if not found or if it's just a placeholder — never invent or guess a contact detail.
11. "candidateValue": ONE short phrase (8-14 words) that captures the single strongest theme connecting the stories and capabilities above — the "why hire this person" in one line (e.g. "turning frontend performance and UX friction into measurable engagement and conversion gains"). This must be derivable purely from the stories/capabilities you already extracted — never introduce a new claim, skill, or achievement that isn't already present elsewhere in this JSON.
12. "honestGap": look for ONE requirement the JD clearly emphasizes that the resume does NOT support (a skill, tool, or type of experience). Phrase it neutrally as a plain noun phrase, not a full sentence. If everything in the JD is reasonably covered by the resume, return null. Never invent a gap that isn't real, and never list more than one. NOTE: this is extracted for internal/data purposes only — it will NOT necessarily appear in the final letter.
13. "availabilityNote": ONLY if the resume explicitly states something relevant to when/where the candidate can work (location, remote/on-site preference, notice period, visa status) that plausibly answers something in the JD, extract it as a short plain phrase. Otherwise return null. Never invent this.

Respond with ONLY raw JSON, no markdown fences, in exactly this shape:
{
  "themeKeywords": ["keyword1", "keyword2"],
  "companyName": null,
  "companyReason": null,
  "candidateName": null,
  "targetJobTitle": null,
  "contactInfo": { "email": null, "phone": null, "linkedin": null, "github": null },
  "candidateValue": "...",
  "honestGap": null,
  "availabilityNote": null,
  "stories": [
    { "problem": "...", "action": "...", "result": "...", "company": null }
  ],
  "capabilityGroups": {
    "frontend": ["short fact", "short fact"]
  },
  "candidateSeniorityGuess": "entry"
}`;
};

// ============================================================
// STAGE 2 — writer (body only — no date/greeting/salutation/signature)
// ============================================================

const formatCapabilityGroups = (capabilityGroups = {}) => {
  return Object.entries(capabilityGroups)
    .filter(([, items]) => items && items.length > 0)
    .map(([category, items]) => `${category}: ${items.join(', ')}`)
    .join('\n');
};

const formatStories = (stories = []) => {
  if (stories.length === 0)
    return '(none — no quantified achievement stories found)';
  return stories
    .map((s) => {
      const companySuffix = s.company ? ` (at ${s.company})` : '';
      return `- ${s.problem} → ${s.action} → ${s.result}${companySuffix}`;
    })
    .join('\n');
};

const buildCoverLetterPrompt = ({
  themeKeywords,
  companyName,
  companyReason,
  targetJobTitle,
  candidateValue,
  honestGap, // eslint-disable-line no-unused-vars -- intentionally received but never surfaced to the model prompt (see note below)
  availabilityNote,
  stories,
  capabilityGroups,
  tone,
  seniorityLevel,
}) => {
  const toneInstruction =
    TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.professional;
  const seniorityInstruction =
    SENIORITY_INSTRUCTIONS[seniorityLevel] || SENIORITY_INSTRUCTIONS.mid;

  return `You are the candidate, writing the BODY of a cover letter in your own voice. The app adds the date, greeting, and signature separately — you must NOT write those.

TONE: ${toneInstruction}
SENIORITY: ${seniorityInstruction}
LENGTH: The full 4-paragraph body must be between ${MIN_WORDS} and ${MAX_WORDS} words (unless tone is "concise", which should run shorter). Never pad with filler sentences just to reach the minimum — hitting every point below cleanly, even if closer to ${MIN_WORDS} than ${MAX_WORDS}, is the goal.

CANDIDATE'S CORE VALUE (this is the narrative spine of the entire letter — every paragraph should reinforce this single theme, not introduce competing themes):
${candidateValue || '(none provided — infer the throughline from the stories and capabilities below instead)'}

BACKGROUND THEMES (context only — never list these words directly): ${(themeKeywords || []).join(', ')}

COMPANY-SPECIFIC DETAIL (use ONCE, only in Paragraph 1, to make the opening non-generic — never repeat it in later paragraphs, never exaggerate it into a claim of domain experience the candidate doesn't have):
${companyReason || '(none — do not invent one; keep paragraph 1 hook purely story/capability-based instead)'}

ACHIEVEMENT STORIES (tell as real moments, in Paragraph 2 — if a company is listed, name it; if the story text mentions working with other roles, that IS the collaboration/soft-skill evidence — let it read naturally, don't bolt on a separate "teamwork" sentence):
${formatStories(stories)}

CAPABILITY GROUPS (select ONLY the strongest that most directly match the JD — using every category or every item is NOT the goal; this is supporting evidence woven into Paragraph 3, not a checklist to complete):
${formatCapabilityGroups(capabilityGroups)}

AVAILABILITY / LOCATION NOTE (mention only in Paragraph 4 if present, only if it plausibly answers something in the job description):
${availabilityNote || '(none — do not invent one)'}

--- STRUCTURE (exactly 4 paragraphs, nothing before or after) ---
1. Hook: a concrete, specific opening tied to the core value above (2-3 sentences).${companyReason ? ` Naturally connect it to the company-specific detail above — make it clear this letter is for THIS company, not a template.` : ''} Do NOT state the exact number/metric that Paragraph 2 will state — hint at the theme only, save the number for Paragraph 2. The opening should implicitly answer "why this candidate over other applicants," not through a stated claim, but through the specificity of the story you're about to tell.
2. Achievement stories, told as real moments — not a list. Name the employer if one is given above.
3. The selected capability groups woven into one flowing paragraph, as evidence supporting the core value — not a category-by-category recitation.
4. Closing: express genuine interest in${targetJobTitle ? ` the ${targetJobTitle} role` : ' this role'}${companyName ? ` at ${companyName}` : ''}. If an availability/location note is provided above, mention it here only if relevant. End with a plain, concrete invitation to talk further.

--- VOICE ---
- Talk like a person, not a list being read aloud.
- Never start consecutive sentences with "I have," "I also," "In addition," "Furthermore," "Moreover," "Additionally."
- Never introduce stories with "For one project" / "In another instance."
- Not every capability item needs a full sentence — minor ones can ride inside a clause — but don't drop an entire selected category once chosen.
${companyName ? `- You may reference "${companyName}" naturally once more in the closing, if it hasn't already appeared.` : ''}

--- WHAT TO NEVER DO ---
- Do NOT mention any skill, tool, or experience gap. Do not acknowledge anything the candidate lacks, even in a confident or minimizing way (e.g. never say "quick to pick up X" or "comfortable learning Y on the job"). An unmentioned gap is invisible to the reader; naming it is a self-inflicted weakness. Simply do not bring it up.
- Do NOT invent an ownership descriptor for a story (solo/independent/team-led) beyond what's given above.
- Do NOT use generic AI-sounding closings like "happy to jump on a call" or "at your convenience."

--- HARD RULES ---
- Every claim must map to something provided above — zero fabrication. Never invent an availability note or company reason that wasn't given to you.
- Never use these phrases or close paraphrases: ${BANNED_PHRASES.join(', ')}.
- Do NOT write a date, "Dear ...", "Subject:", or "Sincerely" — body text only.
- Output ONLY plain text — no markdown, no bullets, no quotes, no preamble.

Write the 4-paragraph body now:`;
};

// ============================================================
// LETTER SCAFFOLDING — deterministic, never AI-generated.
// ============================================================

const buildOpeningBlock = ({ contactLine, targetJobTitle, companyName }) => {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const header = contactLine ? `${contactLine}\n\n` : '';

  const subjectLine = targetJobTitle
    ? `Subject: Application for ${targetJobTitle}\n\n`
    : '';

  const greeting = companyName
    ? `Dear ${companyName} Hiring Team,`
    : 'Dear Hiring Manager,';

  return `${header}${today}\n\n${subjectLine}${greeting}\n\n`;
};

const buildClosingBlock = ({ candidateName }) => {
  return candidateName ? `\n\nSincerely,\n${candidateName}` : '\n\nSincerely,';
};

const wrapAsLetter = ({
  body,
  companyName,
  candidateName,
  contactLine,
  targetJobTitle,
}) => {
  const opening = buildOpeningBlock({
    contactLine,
    targetJobTitle,
    companyName,
  });
  const closing = buildClosingBlock({ candidateName });

  return `${opening}${body.trim()}${closing}`;
};

module.exports = {
  buildMatchExtractionPrompt,
  buildCoverLetterPrompt,
  buildOpeningBlock,
  buildClosingBlock,
  wrapAsLetter,
  BANNED_PHRASES,
  BANNED_SENTENCE_STARTERS,
  SENIORITY_INSTRUCTIONS,
  VALID_CATEGORIES,
  MAX_STORIES,
  MAX_CAPABILITY_CATEGORIES,
  MAX_ITEMS_PER_CATEGORY,
  MIN_WORDS,
  MAX_WORDS,
  EXPECTED_PARAGRAPH_COUNT,
};
