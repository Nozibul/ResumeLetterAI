/**
 * @file CoverLetterService.js
 * @description Cover letter service — business logic only
 * @module modules/cover-letter/services/CoverLetterService
 * @author Nozibul Islam
 * @version 1.0.0
 */

const CoverLetter = require('../models/CoverLetter');
const Resume = require('../../resume/models/Resume');
const { generateCoverLetter } = require('../../../lib/ai/provider');
const { formatResumeForAI } = require('../../../lib/resumeFormatter');
const AppError = require('../../../shared/utils/AppError');

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Resolves resume text from the given source.
 * DB source verifies ownership before returning.
 */
const resolveResumeText = async ({
  resumeSource,
  resumeId,
  resumeText,
  userId,
}) => {
  if (resumeSource === 'db') {
    const resume = await Resume.findOne({
      _id: resumeId,
      userId,
      isActive: true,
    });
    if (!resume) throw new AppError('Resume not found', 404);
    return { text: formatResumeForAI(resume), resumeId: resume._id };
  }

  if (resumeSource === 'paste') {
    return { text: resumeText, resumeId: null };
  }

  // upload — text already extracted by controller via fileExtractor
  if (resumeSource === 'upload') {
    if (!resumeText)
      throw new AppError(
        'Extracted resume text is required for upload source',
        400
      );
    return { text: resumeText, resumeId: null };
  }

  throw new AppError('Invalid resume source', 400);
};

// ============================================================
// PUBLIC SERVICE METHODS
// ============================================================

/**
 * Generate a cover letter and persist it (isSaved: false).
 * Streaming chunks are forwarded via onChunk callback.
 * Returns the saved CoverLetter document.
 */
exports.generate = async ({
  resumeSource,
  resumeId,
  resumeText,
  jobDescription,
  tone,
  userId,
  onChunk,
}) => {
  const { text: finalResumeText, resumeId: finalResumeId } =
    await resolveResumeText({ resumeSource, resumeId, resumeText, userId });

  const content = await generateCoverLetter({
    resumeText: finalResumeText,
    jobDescription,
    tone: tone || 'professional',
    onChunk,
  });

  const coverLetter = await CoverLetter.create({
    userId,
    resumeSource,
    resumeId: finalResumeId,
    resumeText: finalResumeText,
    jobDescription,
    tone: tone || 'professional',
    content,
    isSaved: false,
  });

  return coverLetter;
};

/**
 * Mark a cover letter as saved.
 * Verifies ownership before update.
 */
exports.save = async ({ coverLetterId, userId }) => {
  const coverLetter = await CoverLetter.findOne({
    _id: coverLetterId,
    userId,
  });

  if (!coverLetter) throw new AppError('Cover letter not found', 404);

  coverLetter.isSaved = true;
  await coverLetter.save();

  return coverLetter;
};

/**
 * Get all saved cover letters for a user.
 * resumeText excluded via toJSON transform on the model.
 */
exports.list = async (userId) => {
  return CoverLetter.find({ userId, isSaved: true })
    .select('jobDescription tone createdAt')
    .sort({ createdAt: -1 });
};

/**
 * Get a single cover letter with full content.
 * Verifies ownership.
 */
exports.getById = async ({ coverLetterId, userId }) => {
  const coverLetter = await CoverLetter.findOne({
    _id: coverLetterId,
    userId,
  }).select('+resumeText');

  if (!coverLetter) throw new AppError('Cover letter not found', 404);

  return coverLetter;
};
