// lib/ai/prompt.js

const TONE_INSTRUCTIONS = {
  professional: 'Write in a professional and confident tone.',
  creative: 'Write in a creative and engaging tone that stands out.',
  concise: 'Write concisely, maximum 3 paragraphs, straight to the point.',
  enthusiastic: 'Write with enthusiasm and passion for the role.',
  formal: 'Write in a formal and traditional business letter style.',
};

const buildCoverLetterPrompt = ({ resumeText, jobDescription, tone }) => {
  const toneInstruction =
    TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.professional;

  return `You are an expert cover letter writer.

Write a compelling cover letter based on the following.

TONE: ${toneInstruction}

CANDIDATE RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

RULES:
- Match candidate skills to job requirements specifically
- Highlight most relevant experience only
- Keep it to 3-4 paragraphs
- Never make up information not in the resume
- Do not include date, address, or salutation header
- Start directly with opening paragraph
- End with a clear call to action

Write the cover letter:`;
};

module.exports = { buildCoverLetterPrompt };
