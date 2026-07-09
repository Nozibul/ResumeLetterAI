/**
 * @file CoverLetterController.js
 * @description Cover letter controller — HTTP layer only, no business logic
 * @module modules/cover-letter/controllers/CoverLetterController
 * @author Nozibul Islam
 * @version 1.2.0
 */

const catchAsync = require('../../../shared/utils/catchAsync');
const CoverLetterService = require('../services/CoverLetterService');
const AppError = require('../../../shared/utils/AppError');
const { extractTextFromFile } = require('../../../lib/fileExtractor');

const ALLOWED_SENIORITY_LEVELS = ['entry', 'mid', 'senior', 'lead'];

/**
 * @desc  Generate a cover letter with SSE streaming
 * @route POST /api/v1/cover-letters/generate
 *
 * Content-Type varies by resumeSource:
 * - 'db' / 'paste' → application/json
 * - 'upload'       → multipart/form-data (req.file populated by multer,
 *                     see routes — uploadResume.single('resumeFile'))
 */
exports.generate = catchAsync(async (req, res) => {
  const { resumeSource, resumeId, jobDescription, tone, seniorityLevel } =
    req.body;
  let { resumeText } = req.body;
  const userId = req.user._id;
  const accountFallbackName = req.user.fullName;

  // Validate BEFORE switching to SSE headers, so a normal JSON error response
  // still goes out if this is invalid.
  if (seniorityLevel && !ALLOWED_SENIORITY_LEVELS.includes(seniorityLevel)) {
    throw new AppError(
      `Invalid seniorityLevel. Allowed values: ${ALLOWED_SENIORITY_LEVELS.join(', ')}`,
      400
    );
  }

  // Upload source: extract text from the uploaded file BEFORE SSE headers,
  // so a corrupted/unsupported file returns a normal JSON 400 instead of
  // breaking mid-stream.
  if (resumeSource === 'upload') {
    resumeText = await extractTextFromFile(req.file);
  }

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
      jobDescription,
      tone,
      seniorityLevel,
      accountFallbackName,
      userId,
      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      },
      onStage: (stage) => {
        res.write(`data: ${JSON.stringify({ stage })}\n\n`);
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
