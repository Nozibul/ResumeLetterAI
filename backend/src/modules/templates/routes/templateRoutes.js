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
const { protect, restrictTo } = require('../../auth/middlewares/authMiddleware');
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
router.get('/', validate(getTemplatesQuerySchema), templateController.getAllTemplates);

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
router.get('/:id', validate(getTemplateByIdSchema), templateController.getTemplateById);

/**
 * GET /api/v1/templates/:id/preview
 * @description Get template preview URLs and sample data
 * @param {string} id - Template ID
 * @returns {object} preview data
 * @access Public
 */
router.get('/:id/preview', validate(getTemplateByIdSchema), templateController.getTemplatePreview);

// ==========================================
// PROTECTED ROUTES (Admin/Creator only)
// ==========================================

/**
 * POST /api/v1/templates
 * @description Create new template
 * @body {object} template data
 * @returns {object} created template
 * @access Private (Admin/Creator)
 */
router.post(
  '/',
  protect,
  restrictTo('admin', 'creator'),
  validate(createTemplateSchema),
  templateController.createTemplate
);

/**
 * PATCH /api/v1/templates/:id
 * @description Update template
 * @param {string} id - Template ID
 * @body {object} updated data
 * @returns {object} updated template
 * @access Private (Admin/Creator)
 */
router.patch(
  '/:id',
  protect,
  restrictTo('admin', 'creator'),
  validate(updateTemplateSchema),
  templateController.updateTemplate
);

/**
 * DELETE /api/v1/templates/:id
 * @description Delete template (soft delete - sets isActive: false)
 * @param {string} id - Template ID
 * @returns {object} success message
 * @access Private (Admin only)
 */
router.delete(
  '/:id',
  protect,
  restrictTo('admin'),
  validate(getTemplateByIdSchema),
  templateController.deleteTemplate
);

/**
 * POST /api/v1/templates/:id/duplicate
 * @description Duplicate existing template
 * @param {string} id - Template ID to duplicate
 * @body {string} newTemplateName - Name for duplicated template (optional)
 * @returns {object} duplicated template
 * @access Private (Admin/Creator)
 */
router.post(
  '/:id/duplicate',
  protect,
  restrictTo('admin', 'creator'),
  validate(duplicateTemplateSchema),
  templateController.duplicateTemplate
);

module.exports = router;