// modules/cover-letter/controllers/CoverLetterController.js

const { validationResult } = require('express-validator');
const CoverLetterService = require('../services/CoverLetterService');

const generate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { resumeSource, resumeId, resumeText, jobDescription, tone } = req.body;
  const userId = req.user._id;

  // Streaming headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const coverLetter = await CoverLetterService.generate({
      resumeSource,
      resumeId,
      resumeText,
      jobDescription,
      tone,
      userId,
      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      },
    });

    // Send cover letter id at the end of the stream
    // You will need this id to save it in the frontend
    res.write(
      `data: ${JSON.stringify({ done: true, id: coverLetter._id })}\n\n`
    );
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

const save = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { coverLetterId } = req.body;
    const userId = req.user._id;

    await CoverLetterService.save({ coverLetterId, userId });

    res.status(200).json({ message: 'Cover letter saved successfully' });
  } catch (error) {
    res.status(error.message === 'Cover letter not found' ? 404 : 500).json({
      message: error.message,
    });
  }
};

const list = async (req, res) => {
  try {
    const coverLetters = await CoverLetterService.list(req.user._id);
    res.status(200).json({ coverLetters });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cover letters' });
  }
};

module.exports = { generate, save, list };
