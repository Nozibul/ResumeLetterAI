/**
 * @file ResumeController.js
 * @description Resume controller - HTTP layer only (Clean & Optimized)
 * @module modules/resume/controllers/ResumeController
 * @author Nozibul Islam
 * @version 2.1.0
 * @updated Removed redundant validations, optimized code, enhanced consistency
 */

const catchAsync = require('../../../shared/utils/catchAsync');
const resumeService = require('../services/ResumeService');

/**
 * @desc    Get all user's resumes with pagination
 * @route   GET /api/v1/resumes
 * @access  Private
 */
exports.getUserResumes = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { limit, sort } = req.query;

  const result = await resumeService.getUserResumes(userId, {
    limit,
    sort,
  });

  res.status(200).json({
    success: true,
    message: 'Resumes retrieved successfully',
    data: {
      resumes: result.resumes,
      total: result.total,
      limit: result.limit,
    },
  });
});

/**
 * @desc    Get single resume by ID
 * @route   GET /api/v1/resumes/:id
 * @access  Private (Owner only)
 */
exports.getResumeById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const resume = await resumeService.getResumeById(id, userId);

  res.status(200).json({
    success: true,
    message: 'Resume retrieved successfully',
    data: { resume },
  });
});

/**
 * @desc    Create new resume
 * @route   POST /api/v1/resumes
 * @access  Private
 */
exports.createResume = catchAsync(async (req, res) => {
  const resumeData = req.body;
  const userId = req.user._id;

  const resume = await resumeService.createResume(resumeData, userId);

  res.status(201).json({
    success: true,
    message: 'Resume created successfully',
    data: { resume },
  });
});

/**
 * @desc    Update resume
 * @route   PATCH /api/v1/resumes/:id
 * @access  Private (Owner only)
 */
exports.updateResume = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const userId = req.user._id;

  const resume = await resumeService.updateResume(id, updateData, userId);

  res.status(200).json({
    success: true,
    message: 'Resume updated successfully',
    data: { resume },
  });
});

/**
 * @desc    Delete resume (soft delete)
 * @route   DELETE /api/v1/resumes/:id
 * @access  Private (Owner only)
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
 * @desc    Duplicate resume
 * @route   POST /api/v1/resumes/:id/duplicate
 * @access  Private (Owner only)
 */
exports.duplicateResume = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const userId = req.user._id;

  const resume = await resumeService.duplicateResume(id, userId, title);

  res.status(201).json({
    success: true,
    message: 'Resume duplicated successfully',
    data: { resume },
  });
});

/**
 * @desc    Update section order
 * @route   PATCH /api/v1/resumes/:id/section-order
 * @access  Private (Owner only)
 */
exports.updateSectionOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { sectionOrder } = req.body;
  const userId = req.user._id;

  const resume = await resumeService.updateSectionOrder(
    id,
    sectionOrder,
    userId
  );

  res.status(200).json({
    success: true,
    message: 'Section order updated successfully',
    data: { resume },
  });
});

/**
 * @desc    Update section visibility
 * @route   PATCH /api/v1/resumes/:id/section-visibility
 * @access  Private (Owner only)
 */
exports.updateSectionVisibility = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { sectionVisibility } = req.body;
  const userId = req.user._id;

  const resume = await resumeService.updateSectionVisibility(
    id,
    sectionVisibility,
    userId
  );

  res.status(200).json({
    success: true,
    message: 'Section visibility updated successfully',
    data: { resume },
  });
});

/**
 * @desc    Get resume statistics
 * @route   GET /api/v1/resumes/stats
 * @access  Private
 */
exports.getResumeStats = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const stats = await resumeService.getResumeStats(userId);

  res.status(200).json({
    success: true,
    message: 'Resume statistics retrieved successfully',
    data: { stats },
  });
});

/**
 * @desc    Switch resume template
 * @route   PATCH /api/v1/resumes/:id/template
 * @access  Private (Owner only)
 */
exports.switchTemplate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { templateId } = req.body;
  const userId = req.user._id;

  const resume = await resumeService.switchTemplate(id, templateId, userId);

  res.status(200).json({
    success: true,
    message: 'Template switched successfully',
    data: { resume },
  });
});
