/**
 * @file gemini.js
 * @description Gemini AI provider implementation
 * @module lib/ai/gemini
 * @author Nozibul Islam
 * @version 1.0.0
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildCoverLetterPrompt } = require('./prompt');
const AppError = require('../../shared/utils/AppError');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates cover letter via Gemini with streaming.
 * onChunk callback receives each text chunk as it arrives.
 * Returns the full generated content string.
 */
const generateWithGemini = async ({
  resumeText,
  jobDescription,
  tone,
  onChunk,
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError('AI service is not configured', 503);
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });

  const prompt = buildCoverLetterPrompt({ resumeText, jobDescription, tone });

  const result = await model.generateContentStream(prompt);

  let fullContent = '';

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullContent += chunkText;
    if (onChunk) onChunk(chunkText);
  }

  if (!fullContent.trim()) {
    throw new AppError('AI returned empty response', 502);
  }

  return fullContent;
};

module.exports = { generateWithGemini };
