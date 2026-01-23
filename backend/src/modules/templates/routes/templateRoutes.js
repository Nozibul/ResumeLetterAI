/**
 * @file templateRoutes.js
 * @description Template management routes (Optimized)
 * @module modules/template/routes/templateRoutes
 * @author Nozibul Islam
 * @version 2.0.0
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
  getDeletedTemplatesSchema,
  getCategoryStatsSchema,
  getTemplatePreviewSchema,
  restoreTemplateSchema,
  permanentDeleteTemplateSchema,
  deleteTemplateSchema,
} = require('../validation/templateValidation');

// Controller
const templateController = require('../controllers/TemplateController');

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * GET /api/v1/templates
 * @description Get all active templates with optional filters
 * @query {string} category - Filter by category (optional)
 * @returns {array} Active templates list
 * @access Public
 */
router.get(
  '/',
  validate(getTemplatesQuerySchema),
  templateController.getAllTemplates
);

/**
 * GET /api/v1/templates/categories/stats
 * @description Get template count by category
 * @returns {object} Category-wise template statistics
 * @access Public
 */
router.get(
  '/categories/stats',
  validate(getCategoryStatsSchema),
  templateController.getCategoryStats
);

/**
 * GET /api/v1/templates/deleted
 * @description Get all soft-deleted templates (isActive: false)
 * @query {string} category - Filter by category (optional)
 * @returns {array} Soft-deleted templates list
 * @access Private (Admin only)
 */
router.get(
  '/deleted',
  protect,
  // restrictTo('admin'),
  validate(getDeletedTemplatesSchema),
  templateController.getSoftDeletedTemplates
);

/**
 * GET /api/v1/templates/:id
 * @description Get single template by ID with full structure
 * @param {string} id - Template ID (MongoDB ObjectId)
 * @returns {object} Complete template details
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
 * @returns {object} Preview URLs and sample data
 * @access Public
 */
router.get(
  '/:id/preview',
  validate(getTemplatePreviewSchema),
  templateController.getTemplatePreview
);

// ==========================================
// PROTECTED ROUTES (Authentication Required)
// ==========================================

/**
 * POST /api/v1/templates
 * @description Create new template
 * @body {object} Template data (category, structure, settings, etc.)
 * @returns {object} Created template
 * @access Private (Admin/Creator)
 */
router.post(
  '/',
  protect,
  // restrictTo('admin', 'creator'),
  validate(createTemplateSchema),
  templateController.createTemplate
);

/**
 * POST /api/v1/templates/:id/duplicate
 * @description Duplicate existing template
 * @param {string} id - Source template ID
 * @body {string} description - Optional new description
 * @returns {object} Duplicated template
 * @access Private (Admin/Creator)
 */
router.post(
  '/:id/duplicate',
  protect,
  // restrictTo('admin', 'creator'),
  validate(duplicateTemplateSchema),
  templateController.duplicateTemplate
);

/**
 * PATCH /api/v1/templates/:id
 * @description Update existing template
 * @param {string} id - Template ID
 * @body {object} Updated fields
 * @returns {object} Updated template
 * @access Private (Admin/Creator)
 */
router.patch(
  '/:id',
  protect,
  // restrictTo('admin', 'creator'),
  validate(updateTemplateSchema),
  templateController.updateTemplate
);

/**
 * PATCH /api/v1/templates/:id/restore
 * @description Restore soft-deleted template (sets isActive: true)
 * @param {string} id - Template ID
 * @returns {object} Restored template
 * @access Private (Admin only)
 */
router.patch(
  '/:id/restore',
  protect,
  // restrictTo('admin'),
  validate(restoreTemplateSchema),
  templateController.restoreTemplate
);

/**
 * DELETE /api/v1/templates/:id/permanent
 * @description Permanently delete template from database
 * @param {string} id - Template ID
 * @returns {object} Success message
 * @access Private (Admin only)
 * @warning This action is irreversible
 */
router.delete(
  '/:id/permanent',
  protect,
  // restrictTo('admin'),
  validate(permanentDeleteTemplateSchema),
  templateController.permanentDeleteTemplate
);

/**
 * DELETE /api/v1/templates/:id
 * @description Soft delete template (sets isActive: false)
 * @param {string} id - Template ID
 * @returns {object} Success message
 * @access Private (Admin only)
 * @note Template can be restored later using restore endpoint
 */
router.delete(
  '/:id',
  protect,
  // restrictTo('admin'),
  validate(deleteTemplateSchema),
  templateController.deleteTemplate
);

module.exports = router;
