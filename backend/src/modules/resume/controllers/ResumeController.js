/**
 * @file ResumeController.js
 * @description Resume controller — HTTP layer only, no business logic
 * @module modules/resume/controllers/ResumeController
 * @author Nozibul Islam
 * @version 3.0.0
 * @updated
 *   v3.0.0:
 *   - deleteResume: response now returns { id } instead of null so the client
 *     can update local state without a follow-up fetch.
 *   - getUserResumes: limit coerced to Number before passing to service
 *     (Express query params arrive as strings; z.number() in schema does not
 *     coerce automatically for query strings — fixed in validation schema too).
 *   - All handlers are intentionally thin: parse → call service → respond.
 *     No business logic lives here.
 */

const catchAsync = require('../../../shared/utils/catchAsync');
const resumeService = require('../services/ResumeService');

/**
 * @desc  Get all user resumes with pagination
 * @route GET /api/v1/resumes
 */
exports.getUserResumes = catchAsync(async (req, res) => {
  const { limit, sort } = req.query;

  const result = await resumeService.getUserResumes(req.user._id, {
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
 * @desc  Get single resume by ID
 * @route GET /api/v1/resumes/:id
 */
exports.getResumeById = catchAsync(async (req, res) => {
  const resume = await resumeService.getResumeById(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Resume retrieved successfully',
    data: { resume },
  });
});

/**
 * @desc  Create new resume
 * @route POST /api/v1/resumes
 */
exports.createResume = catchAsync(async (req, res) => {
  const resume = await resumeService.createResume(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: 'Resume created successfully',
    data: { resume },
  });
});

/**
 * @desc  Partially update a resume
 * @route PATCH /api/v1/resumes/:id
 */
exports.updateResume = catchAsync(async (req, res) => {
  const resume = await resumeService.updateResume(
    req.params.id,
    req.body,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: 'Resume updated successfully',
    data: { resume },
  });
});

/**
 * @desc  Soft-delete a resume
 * @route DELETE /api/v1/resumes/:id
 *
 * Returns { id } so the client can remove the item from local state
 * without issuing a follow-up GET.
 */
exports.deleteResume = catchAsync(async (req, res) => {
  const result = await resumeService.deleteResume(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Resume deleted successfully',
    data: result, // { id }
  });
});

/**
 * @desc  Duplicate a resume
 * @route POST /api/v1/resumes/:id/duplicate
 */
exports.duplicateResume = catchAsync(async (req, res) => {
  const resume = await resumeService.duplicateResume(
    req.params.id,
    req.user._id,
    req.body.title
  );

  res.status(201).json({
    success: true,
    message: 'Resume duplicated successfully',
    data: { resume },
  });
});

/**
 * @desc  Update section order (drag & drop)
 * @route PATCH /api/v1/resumes/:id/section-order
 */
exports.updateSectionOrder = catchAsync(async (req, res) => {
  const resume = await resumeService.updateSectionOrder(
    req.params.id,
    req.body.sectionOrder,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: 'Section order updated successfully',
    data: { resume },
  });
});

/**
 * @desc  Toggle section visibility
 * @route PATCH /api/v1/resumes/:id/section-visibility
 */
exports.updateSectionVisibility = catchAsync(async (req, res) => {
  const resume = await resumeService.updateSectionVisibility(
    req.params.id,
    req.body.sectionVisibility,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: 'Section visibility updated successfully',
    data: { resume },
  });
});

/**
 * @desc  Get resume statistics
 * @route GET /api/v1/resumes/stats
 */
exports.getResumeStats = catchAsync(async (req, res) => {
  const stats = await resumeService.getResumeStats(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Resume statistics retrieved successfully',
    data: { stats },
  });
});

/**
 * @desc  Switch resume template
 * @route PATCH /api/v1/resumes/:id/template
 */
exports.switchTemplate = catchAsync(async (req, res) => {
  const resume = await resumeService.switchTemplate(
    req.params.id,
    req.body.templateId,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: 'Template switched successfully',
    data: { resume },
  });
});
