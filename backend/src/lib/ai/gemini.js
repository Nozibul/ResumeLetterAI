// lib/ai/gemini.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildCoverLetterPrompt } = require('./prompt');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateWithGemini = async ({
  resumeText,
  jobDescription,
  tone,
  onChunk,
}) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const prompt = buildCoverLetterPrompt({ resumeText, jobDescription, tone });

  const result = await model.generateContentStream(prompt);

  let fullContent = '';

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullContent += chunkText;

    if (onChunk) {
      onChunk(chunkText);
    }
  }

  return fullContent;
};

module.exports = { generateWithGemini };
