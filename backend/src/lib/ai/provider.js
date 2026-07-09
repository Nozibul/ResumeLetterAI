/**
 * @file provider.js
 * @description AI provider abstraction — Adapter Pattern
 * @module lib/ai/provider
 * @author Nozibul Islam
 * @version 1.1.0
 *
 * All code calls this file only.
 * To switch providers, change only the import below.
 */

const { generateWithGemini } = require('./gemini');

const generateCoverLetter = async ({
  resumeText,
  jobDescription,
  tone,
  seniorityLevel,
  accountFallbackName,
  onChunk,
  onStage,
}) => {
  return generateWithGemini({
    resumeText,
    jobDescription,
    tone,
    seniorityLevel,
    accountFallbackName,
    onChunk,
    onStage,
  });
};

module.exports = { generateCoverLetter };
