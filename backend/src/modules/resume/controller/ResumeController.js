/**
 * @file ResumeController.js
 * @description Resume controller (handles request/response only)
 * @module modules/resume/controllers/ResumeController
 * @author Nozibul Islam
 * @version 1.0.0
 */

const catchAsync = require('../../../shared/utils/catchAsync');
const resumeService = require('../services/ResumeService');

// ==========================================
// RESUME CRUD OPERATIONS
// ==========================================

/**
 * @desc    Create new resume
 * @route   POST /api/v1/resumes
 * @access  Private
 */
exports.createResume = catchAsync(async (req, res) => {
  const userId = req.user._id; // From protect middleware
  const resumeData = req.body;

  const resume = await resumeService.createResume(userId, resumeData);

  res.status(201).json({
    success: true,
    message: 'Resume created successfully',
    data: { resume },
  });
});

/**
 * @desc    Get all resumes of logged-in user
 * @route   GET /api/v1/resumes
 * @access  Private
 */
exports.getAllResumes = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const resumes = await resumeService.getAllResumes(userId);

  res.status(200).json({
    success: true,
    data: {
      resumes,
      total: resumes.length,
    },
  });
});

/**
 * @desc    Get all draft resumes (incomplete)
 * @route   GET /api/v1/resumes/drafts
 * @access  Private
 */
exports.getDraftResumes = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const drafts = await resumeService.getDraftResumes(userId);

  res.status(200).json({
    success: true,
    data: {
      resumes: drafts,
      total: drafts.length,
    },
  });
});

/**
 * @desc    Get all completed resumes
 * @route   GET /api/v1/resumes/completed
 * @access  Private
 */
exports.getCompletedResumes = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const completed = await resumeService.getCompletedResumes(userId);

  res.status(200).json({
    success: true,
    data: {
      resumes: completed,
      total: completed.length,
    },
  });
});

/**
 * @desc    Get single resume by ID
 * @route   GET /api/v1/resumes/:id
 * @access  Private
 */
exports.getResumeById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const resume = await resumeService.getResumeById(id, userId);

  res.status(200).json({
    success: true,
    data: { resume },
  });
});

/**
 * @desc    Update resume content
 * @route   PATCH /api/v1/resumes/:id
 * @access  Private
 */
exports.updateResume = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const updateData = req.body;

  const resume = await resumeService.updateResume(id, userId, updateData);

  res.status(200).json({
    success: true,
    message: 'Resume updated successfully',
    data: { resume },
  });
});

/**
 * @desc    Update resume title only
 * @route   PATCH /api/v1/resumes/:id/title
 * @access  Private
 */
exports.updateResumeTitle = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { resumeTitle } = req.body;

  const resume = await resumeService.updateResumeTitle(id, userId, resumeTitle);

  res.status(200).json({
    success: true,
    message: 'Resume title updated successfully',
    data: { resume },
  });
});

/**
 * @desc    Delete resume
 * @route   DELETE /api/v1/resumes/:id
 * @access  Private
 */
exports.deleteResume = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  await resumeService.deleteResume(id, userId);

  res.status(200).json({
    success: true,
    message: 'Resume deleted successfully',
    data: null,
  });
});

/**
 * @desc    Duplicate existing resume
 * @route   POST /api/v1/resumes/:id/duplicate
 * @access  Private
 */
exports.duplicateResume = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const resume = await resumeService.duplicateResume(id, userId);

  res.status(201).json({
    success: true,
    message: 'Resume duplicated successfully',
    data: { resume },
  });
});

/**
 * @desc    Toggle resume public/private
 * @route   PATCH /api/v1/resumes/:id/visibility
 * @access  Private
 */
exports.toggleVisibility = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { isPublic } = req.body;

  const resume = await resumeService.toggleVisibility(id, userId, isPublic);

  res.status(200).json({
    success: true,
    message: `Resume is now ${isPublic ? 'public' : 'private'}`,
    data: { resume },
  });
});

/**
 * @desc    Track resume download
 * @route   POST /api/v1/resumes/:id/download
 * @access  Private
 */
exports.trackDownload = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  await resumeService.trackDownload(id, userId);

  res.status(200).json({
    success: true,
    message: 'Download tracked successfully',
    data: null,
  });
});
