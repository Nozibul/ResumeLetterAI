/**
 * @file templateRoutes.js
 * @description Template management routes
 * @module modules/template/routes/templateRoutes
 * @author Nozibul Islam
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();

// Middleware
const {
  protect,
  restrictTo,
} = require('../../auth/middlewares/authMiddleware');
const { validate } = require('../../middleware/validate');

// Validation schemas
const {
  createTemplateSchema,
  updateTemplateSchema,
  getTemplateByIdSchema,
  duplicateTemplateSchema,
  getTemplatesQuerySchema,
} = require('../validation/templateValidation');

// Controller
const templateController = require('../controller/TemplateController');

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * GET /api/v1/templates
 * @description Get all templates (with optional category filter)
 * @query {string} category - Filter by category (optional)
 * @returns {array} templates list
 * @access Public
 */
router.get(
  '/',
  validate(getTemplatesQuerySchema),
  templateController.getAllTemplates
);

/**
 * GET /api/v1/templates/categories/stats
 * @description Get template count by category (for home page)
 * @returns {object} category stats
 * @access Public
 */
router.get('/categories/stats', templateController.getCategoryStats);

/**
 * GET /api/v1/templates/:id
 * @description Get single template by ID (with full structure)
 * @param {string} id - Template ID
 * @returns {object} template details
 * @access Public
 */
router.get(
  '/:id',
  validate(getTemplateByIdSchema),
  templateController.getTemplateById
);

/**
 * GET /api/v1/templates/:id/preview
 * @description Get template preview URLs and sample data
 * @param {string} id - Template ID
 * @returns {object} preview data
 * @access Public
 */
router.get(
  '/:id/preview',
  validate(getTemplateByIdSchema),
  templateController.getTemplatePreview
);

// ==========================================
// PROTECTED ROUTES (Admin/Creator only)
// ==========================================

/**
 * POST /api/v1/templates
 * @description Create new template
 * @body {object} template data
 * @returns {object} created template
 * @access Private
 */
router.post(
  '/',
  protect,
  // restrictTo('admin', 'creator'), // COMMENTED FOR TESTING
  validate(createTemplateSchema),
  templateController.createTemplate
);

/**
 * PATCH /api/v1/templates/:id
 * @description Update template
 * @param {string} id - Template ID
 * @body {object} updated data
 * @returns {object} updated template
 * @access Private
 */
router.patch(
  '/:id',
  protect,
  // restrictTo('admin', 'creator'), // COMMENTED FOR TESTING
  validate(updateTemplateSchema),
  templateController.updateTemplate
);

/**
 * POST /api/v1/templates/:id/duplicate
 * @description Duplicate existing template
 * @param {string} id - Template ID to duplicate
 * @body {string} newTemplateName - Name for duplicated template (optional)
 * @returns {object} duplicated template
 * @access Private
 */
router.post(
  '/:id/duplicate',
  protect,
  // restrictTo('admin', 'creator'), // COMMENTED FOR TESTING
  validate(duplicateTemplateSchema),
  templateController.duplicateTemplate
);

// ==========================================
// SOFT DELETE MANAGEMENT ROUTES
// ==========================================
// Note: These routes MUST come BEFORE the DELETE /:id route
// because Express matches routes top-to-bottom. If DELETE /:id
// comes first, it will match /deleted and /:id/restore as /:id
// and the correct handlers will never execute.

/**
 * GET /api/v1/templates/deleted
 * @description Get all soft-deleted templates (isActive: false)
 * @returns {array} soft-deleted templates list
 * @access Private (Admin only) - TEMPORARILY OPEN FOR TESTING
 * @purpose Allows admins to see which templates have been deleted
 */
router.get(
  '/deleted',
  protect,
  // restrictTo('admin'), // COMMENTED FOR TESTING
  templateController.getSoftDeletedTemplates
);

/**
 * PATCH /api/v1/templates/:id/restore
 * @description Restore a soft-deleted template (sets isActive: true)
 * @param {string} id - Template ID
 * @returns {object} restored template
 * @access Private (Admin only)
 * @purpose Recover templates that were deleted by mistake
 */
router.patch(
  '/:id/restore',
  protect,
  // restrictTo('admin'), // COMMENTED FOR TESTING
  validate(getTemplateByIdSchema),
  templateController.restoreTemplate
);

/**
 * DELETE /api/v1/templates/:id/permanent
 * @description Permanently delete template from database
 * @param {string} id - Template ID
 * @returns {object} success message
 * @access Private (Admin only)
 * @purpose Final cleanup / completely remove from database
 */
router.delete(
  '/:id/permanent',
  protect,
  // restrictTo('admin'), // COMMENTED FOR TESTING
  validate(getTemplateByIdSchema),
  templateController.permanentDeleteTemplate
);

/**
 * DELETE /api/v1/templates/:id
 * @description Delete template (soft delete - sets isActive: false)
 * @param {string} id - Template ID
 * @returns {object} success message
 * @access Private (Authenticated user)
 * @note This route MUST be placed AFTER all other /:id/* routes
 * because it's the most generic pattern and would override other routes if placed first
 */
router.delete(
  '/:id',
  protect,
  // restrictTo('admin'), // COMMENTED FOR TESTING
  validate(getTemplateByIdSchema),
  templateController.deleteTemplate
);

module.exports = router;
