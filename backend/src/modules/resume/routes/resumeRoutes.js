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
  updateResumeTitleSchema,
} = require('../validation/resumeValidation');

// Controller
const resumeController = require('../controller/ResumeController');

// ==========================================
// PROTECTED ROUTES (All resume routes require authentication)
// ==========================================

/**
 * POST /api/v1/resumes
 * @description Create new resume (select template)
 * @body {string} templateId, {string} resumeTitle
 * @returns {object} created resume
 * @access Private
 */
router.post('/', protect, validate(createResumeSchema), resumeController.createResume);

/**
 * GET /api/v1/resumes
 * @description Get all resumes of logged-in user
 * @returns {array} user's resumes
 * @access Private
 */
router.get('/', protect, resumeController.getAllResumes);

/**
 * GET /api/v1/resumes/drafts
 * @description Get all draft resumes (incomplete)
 * @returns {array} draft resumes
 * @access Private
 */
router.get('/drafts', protect, resumeController.getDraftResumes);

/**
 * GET /api/v1/resumes/completed
 * @description Get all completed resumes
 * @returns {array} completed resumes
 * @access Private
 */
router.get('/completed', protect, resumeController.getCompletedResumes);

/**
 * GET /api/v1/resumes/:id
 * @description Get single resume by ID
 * @param {string} id - Resume ID
 * @returns {object} resume details
 * @access Private
 */
router.get('/:id', protect, validate(getResumeByIdSchema), resumeController.getResumeById);

/**
 * PATCH /api/v1/resumes/:id
 * @description Update resume content
 * @param {string} id - Resume ID
 * @body {object} content - Updated resume content
 * @returns {object} updated resume
 * @access Private
 */
router.patch('/:id', protect, validate(updateResumeSchema), resumeController.updateResume);

/**
 * PATCH /api/v1/resumes/:id/title
 * @description Update resume title only
 * @param {string} id - Resume ID
 * @body {string} resumeTitle - New title
 * @returns {object} updated resume
 * @access Private
 */
router.patch(
  '/:id/title',
  protect,
  validate(updateResumeTitleSchema),
  resumeController.updateResumeTitle
);

/**
 * DELETE /api/v1/resumes/:id
 * @description Delete resume
 * @param {string} id - Resume ID
 * @returns {object} success message
 * @access Private
 */
router.delete('/:id', protect, validate(getResumeByIdSchema), resumeController.deleteResume);

/**
 * POST /api/v1/resumes/:id/duplicate
 * @description Duplicate existing resume
 * @param {string} id - Resume ID to duplicate
 * @returns {object} duplicated resume
 * @access Private
 */
router.post(
  '/:id/duplicate',
  protect,
  validate(getResumeByIdSchema),
  resumeController.duplicateResume
);

/**
 * PATCH /api/v1/resumes/:id/visibility
 * @description Toggle resume public/private
 * @param {string} id - Resume ID
 * @body {boolean} isPublic
 * @returns {object} updated resume
 * @access Private
 */
router.patch(
  '/:id/visibility',
  protect,
  validate(getResumeByIdSchema),
  resumeController.toggleVisibility
);

/**
 * POST /api/v1/resumes/:id/download
 * @description Track resume download (increment count)
 * @param {string} id - Resume ID
 * @returns {object} success message
 * @access Private
 */
router.post(
  '/:id/download',
  protect,
  validate(getResumeByIdSchema),
  resumeController.trackDownload
);

module.exports = router;
