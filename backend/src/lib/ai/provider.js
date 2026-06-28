/**
 * @file provider.js
 * @description AI provider abstraction — Adapter Pattern
 * @module lib/ai/provider
 * @author Nozibul Islam
 * @version 1.0.0
 *
 * All code calls this file only.
 * To switch providers, change only the import below.
 */

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
