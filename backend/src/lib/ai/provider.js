// lib/ai/provider.js

const { generateWithGemini } = require('./gemini');

const generateCoverLetter = async ({
  resumeText,
  jobDescription,
  tone,
  onChunk,
}) => {
  return generateWithGemini({ resumeText, jobDescription, tone, onChunk });
};

module.exports = { generateCoverLetter };
