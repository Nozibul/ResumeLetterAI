/**
 * @file CoverLetterController.js
 * @description Cover letter controller — HTTP layer only, no business logic
 * @module modules/cover-letter/controllers/CoverLetterController
 * @author Nozibul Islam
 * @version 1.0.0
 */

const catchAsync = require('../../../shared/utils/catchAsync');
const CoverLetterService = require('../services/CoverLetterService');

/**
 * @desc  Generate a cover letter with SSE streaming
 * @route POST /api/v1/cover-letters/generate
 */
exports.generate = catchAsync(async (req, res) => {
  const { resumeSource, resumeId, resumeText, jobDescription, tone } = req.body;
  const userId = req.user._id;

  // SSE headers — client receives chunks in real time
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const coverLetter = await CoverLetterService.generate({
      resumeSource,
      resumeId,
      resumeText,
      // resumeSource === 'upload' ? req.file?.extractedText : resumeText,
      jobDescription,
      tone,
      userId,
      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      },
    });

    // Signal completion and return id for save action
    res.write(
      `data: ${JSON.stringify({ done: true, id: coverLetter._id })}\n\n`
    );
    res.end();
  } catch (error) {
    res.write(
      `data: ${JSON.stringify({ error: error.message || 'Generation failed' })}\n\n`
    );
    res.end();
  }
});

/**
 * @desc  Mark a cover letter as saved
 * @route POST /api/v1/cover-letters/save
 */
exports.save = catchAsync(async (req, res) => {
  const { coverLetterId } = req.body;

  await CoverLetterService.save({ coverLetterId, userId: req.user._id });

  res.status(200).json({
    success: true,
    message: 'Cover letter saved successfully',
  });
});

/**
 * @desc  Get all saved cover letters
 * @route GET /api/v1/cover-letters
 */
exports.list = catchAsync(async (req, res) => {
  const coverLetters = await CoverLetterService.list(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Cover letters retrieved successfully',
    data: { coverLetters },
  });
});

/**
 * @desc  Get single cover letter with full content
 * @route GET /api/v1/cover-letters/:id
 */
exports.getById = catchAsync(async (req, res) => {
  const coverLetter = await CoverLetterService.getById({
    coverLetterId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: 'Cover letter retrieved successfully',
    data: { coverLetter },
  });
});
