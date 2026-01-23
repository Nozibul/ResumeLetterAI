/**
 * @file TemplateController.js
 * @description Template controller (handles request/response only)
 * @module modules/template/controllers/TemplateController
 * @author Nozibul Islam
 * @version 1.0.0
 */

const catchAsync = require('../../../shared/utils/catchAsync');
const templateService = require('../services/TemplateService');

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

/**
 * @desc    Get all templates (with optional category filter)
 * @route   GET /api/v1/templates?category=corporate
 * @access  Public
 */
exports.getAllTemplates = catchAsync(async (req, res) => {
  const { category } = req.query;

  const templates = await templateService.getAllTemplates(category);

  res.status(200).json({
    success: true,
    data: {
      templates,
      total: templates.length,
    },
  });
});

/**
 * @desc    Get template count by category (for home page)
 * @route   GET /api/v1/templates/categories/stats
 * @access  Public
 */
exports.getCategoryStats = catchAsync(async (_, res) => {
  const stats = await templateService.getCategoryStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * @desc    Get single template by ID
 * @route   GET /api/v1/templates/:id
 * @access  Public
 */
exports.getTemplateById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const template = await templateService.getTemplateById(id);

  res.status(200).json({
    success: true,
    data: { template },
  });
});

/**
 * @desc    Get template preview URLs and sample data
 * @route   GET /api/v1/templates/:id/preview
 * @access  Public
 */
exports.getTemplatePreview = catchAsync(async (req, res) => {
  const { id } = req.params;

  const preview = await templateService.getTemplatePreview(id);

  res.status(200).json({
    success: true,
    data: preview,
  });
});

// ==========================================
// PROTECTED ENDPOINTS (Admin/Creator)
// ==========================================

/**
 * @desc    Create new template
 * @route   POST /api/v1/templates
 * @access  Private (Admin/Creator)
 */
exports.createTemplate = catchAsync(async (req, res) => {
  const templateData = req.body;
  const createdBy = req.user._id; // From protect middleware

  const template = await templateService.createTemplate(
    templateData,
    createdBy
  );

  res.status(201).json({
    success: true,
    message: 'Template created successfully',
    data: { template },
  });
});

/**
 * @desc    Update template
 * @route   PATCH /api/v1/templates/:id
 * @access  Private (Admin/Creator)
 */
exports.updateTemplate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const template = await templateService.updateTemplate(id, updateData);

  res.status(200).json({
    success: true,
    message: 'Template updated successfully',
    data: { template },
  });
});

/**
 * @desc    Duplicate existing template
 * @route   POST /api/v1/templates/:id/duplicate
 * @access  Private (Admin/Creator)
 */
exports.duplicateTemplate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  const createdBy = req.user._id; // From protect middleware

  const template = await templateService.duplicateTemplate(
    id,
    description,
    createdBy
  );

  res.status(201).json({
    success: true,
    message: 'Template duplicated successfully',
    data: { template },
  });
});

/**
 * @desc    Get all soft-deleted templates
 * @route   GET /api/v1/templates/deleted
 * @access  Private (Admin - TEMPORARILY OPEN)
 */
exports.getSoftDeletedTemplates = catchAsync(async (_, res) => {
  const templates = await templateService.getSoftDeletedTemplates();

  res.status(200).json({
    success: true,
    data: {
      templates,
      total: templates.length,
    },
  });
});

/**
 * @desc    Restore soft-deleted template
 * @route   PATCH /api/v1/templates/:id/restore
 * @access  Private (Admin - TEMPORARILY OPEN)
 */
exports.restoreTemplate = catchAsync(async (req, res) => {
  const { id } = req.params;

  const template = await templateService.restoreTemplate(id);

  res.status(200).json({
    success: true,
    message: 'Template restored successfully',
    data: { template },
  });
});

/**
 * @desc    Permanently delete template
 * @route   DELETE /api/v1/templates/:id/permanent
 * @access  Private (Admin - TEMPORARILY OPEN)
 */
exports.permanentDeleteTemplate = catchAsync(async (req, res) => {
  const { id } = req.params;

  await templateService.permanentDeleteTemplate(id);

  res.status(200).json({
    success: true,
    message: 'Template permanently deleted',
    data: null,
  });
});

/**
 * @desc    Delete template (soft delete)
 * @route   DELETE /api/v1/templates/:id
 * @access  Private (Admin only)
 */
exports.deleteTemplate = catchAsync(async (req, res) => {
  const { id } = req.params;

  await templateService.deleteTemplate(id);

  res.status(200).json({
    success: true,
    message: 'Template deleted successfully',
    data: null,
  });
});
