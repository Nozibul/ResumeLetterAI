/**
 * @file resumeRoutes.js
 * @description Resume management routes (Complete & Optimized)
 * @module modules/resume/routes/resumeRoutes
 * @author Nozibul Islam
 * @version 2.1.0
 * @updated Added missing validations, fixed import path, enhanced security
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
  updateSectionOrderSchema,
  updateSectionVisibilitySchema,
  switchTemplateSchema,
} = require('../validation/resumeValidation');

// Controller
const resumeController = require('../controllers/ResumeController');

// ==========================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ==========================================
router.use(protect);

// ==========================================
// COLLECTION ROUTES (No :id)
// ⚠️ IMPORTANT: These MUST come before /:id routes
// ==========================================

/**
 * GET /api/v1/resumes/stats
 * @description Get user's resume statistics
 * @returns {object} resume stats (total, completed, avg completion)
 * @access Private
 */
router.get('/stats', resumeController.getResumeStats);

/**
 * GET /api/v1/resumes
 * @description Get all user's resumes with pagination
 * @query {number} limit - Results per page (default: 10, max: 100)
 * @query {string} sort - Sort option (newest|oldest|title)
 * @access Private
 */
router.get(
  '/',
  validate(getUserResumesQuerySchema),
  resumeController.getUserResumes
);

/**
 * POST /api/v1/resumes
 * @description Create new resume
 * @access Private
 */
router.post('/', validate(createResumeSchema), resumeController.createResume);

// ==========================================
// SINGLE RESOURCE ROUTES (With :id)
// ==========================================

/**
 * GET /api/v1/resumes/:id
 * @description Get single resume by ID
 * @param {string} id - Resume ID (24-char hex)
 * @access Private (Owner only)
 */
router.get(
  '/:id',
  validate(getResumeByIdSchema),
  resumeController.getResumeById
);

/**
 * PATCH /api/v1/resumes/:id
 * @description Update resume (partial update)
 * @param {string} id - Resume ID
 * @access Private (Owner only)
 */
router.patch(
  '/:id',
  validate(updateResumeSchema),
  resumeController.updateResume
);

/**
 * DELETE /api/v1/resumes/:id
 * @description Soft delete resume (sets isActive: false)
 * @param {string} id - Resume ID
 * @access Private (Owner only)
 */
router.delete(
  '/:id',
  validate(deleteResumeSchema),
  resumeController.deleteResume
);

// ==========================================
// RESOURCE ACTIONS (With :id + action)
// ==========================================

/**
 * POST /api/v1/resumes/:id/duplicate
 * @description Duplicate existing resume
 * @param {string} id - Resume ID to duplicate
 * @access Private (Owner only)
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
 * @access Private (Owner only)
 */
router.patch(
  '/:id/section-order',
  validate(updateSectionOrderSchema),
  resumeController.updateSectionOrder
);

/**
 * PATCH /api/v1/resumes/:id/section-visibility
 * @description Toggle section visibility (show/hide)
 * @param {string} id - Resume ID
 * @access Private (Owner only)
 */
router.patch(
  '/:id/section-visibility',
  validate(updateSectionVisibilitySchema),
  resumeController.updateSectionVisibility
);

/**
 * PATCH /api/v1/resumes/:id/template
 * @description Switch resume template
 * @param {string} id - Resume ID
 * @access Private (Owner only)
 */
router.patch(
  '/:id/template',
  validate(switchTemplateSchema),
  resumeController.switchTemplate
);

module.exports = router;
