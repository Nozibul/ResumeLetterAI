/**
 * @file resumeRoutes.js
 * @description Resume management routes
 * @module modules/resume/routes/resumeRoutes
 * @author Nozibul Islam
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();

// Middleware
const { protect } = require('../../auth/middlewares/authMiddleware');
const { validate } = require('../../middleware/validate');

// Validation schemas
const {
  createResumeSchema,
  updateResumeSchema,
  getResumeByIdSchema,
  deleteResumeSchema,
  duplicateResumeSchema,
  getUserResumesQuerySchema,
} = require('../validation/resumeValidation');

// Controller
const resumeController = require('../controller/ResumeController');

// ==========================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ==========================================
router.use(protect);

// ==========================================
// RESUME CRUD ROUTES
// ==========================================

/**
 * GET /api/v1/resumes
 * @description Get all user's resumes
 * @query {number} limit - Limit results (optional)
 * @query {string} sort - Sort field (optional, default: -updatedAt)
 * @returns {array} resumes list
 * @access Private (Authenticated user)
 */
router.get(
  '/',
  validate(getUserResumesQuerySchema),
  resumeController.getUserResumes
);

/**
 * GET /api/v1/resumes/stats
 * @description Get user's resume statistics
 * @returns {object} resume stats (total, completed, average completion)
 * @access Private (Authenticated user)
 */
router.get('/stats', resumeController.getResumeStats);

/**
 * GET /api/v1/resumes/:id
 * @description Get single resume by ID
 * @param {string} id - Resume ID
 * @returns {object} resume details
 * @access Private (Resume owner)
 */
router.get(
  '/:id',
  validate(getResumeByIdSchema),
  resumeController.getResumeById
);

/**
 * POST /api/v1/resumes
 * @description Create new resume
 * @body {object} resume data
 * @returns {object} created resume
 * @access Private (Authenticated user)
 */
router.post('/', validate(createResumeSchema), resumeController.createResume);

/**
 * PATCH /api/v1/resumes/:id
 * @description Update resume
 * @param {string} id - Resume ID
 * @body {object} updated data
 * @returns {object} updated resume
 * @access Private (Resume owner)
 */
router.patch(
  '/:id',
  validate(updateResumeSchema),
  resumeController.updateResume
);

/**
 * DELETE /api/v1/resumes/:id
 * @description Delete resume (soft delete - sets isActive: false)
 * @param {string} id - Resume ID
 * @returns {object} success message
 * @access Private (Resume owner)
 */
router.delete(
  '/:id',
  validate(deleteResumeSchema),
  resumeController.deleteResume
);

// ==========================================
// RESUME MANAGEMENT ROUTES
// ==========================================

/**
 * POST /api/v1/resumes/:id/duplicate
 * @description Duplicate existing resume
 * @param {string} id - Resume ID to duplicate
 * @body {string} title - New resume title (optional)
 * @returns {object} duplicated resume
 * @access Private (Resume owner)
 */
router.post(
  '/:id/duplicate',
  validate(duplicateResumeSchema),
  resumeController.duplicateResume
);

/**
 * PATCH /api/v1/resumes/:id/section-order
 * @description Update section order (drag & drop)
 * @param {string} id - Resume ID
 * @body {array} sectionOrder - New section order
 * @returns {object} updated resume
 * @access Private (Resume owner)
 */
router.patch(
  '/:id/section-order',
  validate(getResumeByIdSchema),
  resumeController.updateSectionOrder
);

/**
 * PATCH /api/v1/resumes/:id/section-visibility
 * @description Update section visibility (show/hide sections)
 * @param {string} id - Resume ID
 * @body {object} sectionVisibility - Section visibility map
 * @returns {object} updated resume
 * @access Private (Resume owner)
 */
router.patch(
  '/:id/section-visibility',
  validate(getResumeByIdSchema),
  resumeController.updateSectionVisibility
);

/**
 * PATCH /api/v1/resumes/:id/switch-template
 * @description Switch resume template
 * @param {string} id - Resume ID
 * @body {string} templateId - New template ID
 * @returns {object} updated resume
 * @access Private (Resume owner)
 */
router.patch(
  '/:id/switch-template',
  validate(getResumeByIdSchema),
  resumeController.switchTemplate
);

module.exports = router;
