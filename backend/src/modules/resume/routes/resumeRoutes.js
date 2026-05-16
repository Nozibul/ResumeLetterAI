/**
 * @file resumeRoutes.js
 * @description Resume management routes
 * @module modules/resume/routes/resumeRoutes
 * @author Nozibul Islam
 * @version 3.0.0
 * @updated
 *   v3.0.0:
 *   - Rate limiting added to POST / and POST /:id/duplicate to prevent
 *     resume-creation abuse (e.g. loop creating thousands of documents).
 *   - Route ordering preserved: collection routes before /:id routes so
 *     /stats is never swallowed by the dynamic :id segment.
 *   - All routes require authentication via router.use(protect).
 */

const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const { protect } = require('../../auth/middlewares/authMiddleware');
const { validate } = require('../../middleware/validate');

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

const resumeController = require('../controllers/ResumeController');

// ============================================================
// RATE LIMITERS
// ============================================================

// Limits resume creation and duplication to 20 requests per hour per user.
// Without this, a single user could loop-create thousands of resumes.
// Adjust windowMs / max based on your product's expected usage patterns.
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: {
    success: false,
    message: 'Too many resumes created. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================
// AUTHENTICATION — all resume routes require a valid token
// ============================================================

router.use(protect);

// ============================================================
// COLLECTION ROUTES
// IMPORTANT: these must come before /:id routes so that /stats
// is not matched as a resume ID.
// ============================================================

/**
 * GET /api/v1/resumes/stats
 * Returns aggregated statistics for the authenticated user's resumes.
 */
router.get('/stats', resumeController.getResumeStats);

/**
 * GET /api/v1/resumes
 * Returns all active resumes for the user with pagination.
 * @query limit {number} 1–50, default 10
 * @query sort  {string} newest | oldest | title
 */
router.get(
  '/',
  validate(getUserResumesQuerySchema),
  resumeController.getUserResumes
);

/**
 * POST /api/v1/resumes
 * Creates a new resume.
 * Rate-limited: 20 per hour per user.
 */
router.post(
  '/',
  createLimiter,
  validate(createResumeSchema),
  resumeController.createResume
);

// ============================================================
// SINGLE RESOURCE ROUTES /:id
// ============================================================

/**
 * GET /api/v1/resumes/:id
 * Returns a single resume with full template details.
 */
router.get(
  '/:id',
  validate(getResumeByIdSchema),
  resumeController.getResumeById
);

/**
 * PATCH /api/v1/resumes/:id
 * Partially updates a resume. At least one field required.
 */
router.patch(
  '/:id',
  validate(updateResumeSchema),
  resumeController.updateResume
);

/**
 * DELETE /api/v1/resumes/:id
 * Soft-deletes a resume (sets isActive: false).
 * Returns { id } so clients can update local state without a follow-up fetch.
 */
router.delete(
  '/:id',
  validate(deleteResumeSchema),
  resumeController.deleteResume
);

// ============================================================
// RESOURCE ACTION ROUTES /:id/action
// ============================================================

/**
 * POST /api/v1/resumes/:id/duplicate
 * Duplicates an existing resume.
 * Rate-limited: shares the same 20/hour window as creation.
 */
router.post(
  '/:id/duplicate',
  createLimiter,
  validate(duplicateResumeSchema),
  resumeController.duplicateResume
);

/**
 * PATCH /api/v1/resumes/:id/section-order
 * Updates the display order of resume sections (drag & drop).
 */
router.patch(
  '/:id/section-order',
  validate(updateSectionOrderSchema),
  resumeController.updateSectionOrder
);

/**
 * PATCH /api/v1/resumes/:id/section-visibility
 * Toggles visibility of one or more resume sections.
 * Partial update — only provided sections are affected.
 */
router.patch(
  '/:id/section-visibility',
  validate(updateSectionVisibilitySchema),
  resumeController.updateSectionVisibility
);

/**
 * PATCH /api/v1/resumes/:id/template
 * Switches the resume to a different template.
 */
router.patch(
  '/:id/template',
  validate(switchTemplateSchema),
  resumeController.switchTemplate
);

module.exports = router;
