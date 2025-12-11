/**
 * @file TemplateService.js
 * @description Template business logic
 * @module modules/template/services/TemplateService
 * @author Nozibul Islam
 * @version 1.0.0
 */

const Template = require('../models/Template');
const AppError = require('../../../shared/utils/AppError');

// ==========================================
// PUBLIC SERVICES
// ==========================================

/**
 * Get all templates (with optional category filter)
 * @param {string} category - Optional category filter
 * @returns {Promise<Array>} List of templates
 */
exports.getAllTemplates = async (category) => {
  const query = { isActive: true };

  // Apply category filter if provided
  if (category) {
    query.category = category;
  }

  const templates = await Template.find(query)
    .select('-structure') // Exclude structure for list view (lighter payload)
    .sort({ usageCount: -1, rating: -1, createdAt: -1 })
    .lean();

  return templates;
};

/**
 * Get template count by category (for home page stats)
 * @returns {Promise<Object>} Category-wise template count
 */
exports.getCategoryStats = async () => {
  const stats = await Template.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        count: 1,
      },
    },
  ]);

  // Transform to object format: { "corporate": 5, "ats-friendly": 3, ... }
  const result = {};
  stats.forEach((item) => {
    result[item.category] = item.count;
  });

  return result;
};

/**
 * Get single template by ID (with full structure)
 * @param {string} id - Template ID
 * @returns {Promise<Object>} Template details
 */
exports.getTemplateById = async (id) => {
  const template = await Template.findOne({ _id: id, isActive: true }).lean();

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  return template;
};

/**
 * Get template preview data
 * @param {string} id - Template ID
 * @returns {Promise<Object>} Preview URLs and sample data
 */
exports.getTemplatePreview = async (id) => {
  const template = await Template.findOne({ _id: id, isActive: true })
    .select('previewUrl thumbnailUrl')
    .lean();

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Sample data for preview (you can customize this based on template)
  const sampleData = {
    header: {
      fullName: 'ANNA COEHLO',
      position: 'UI/UX Designer',
      email: 'anna.coehlo@example.com',
      phone: '+1 234 567 8900',
      location: 'New York, USA',
    },
    profile: {
      summary:
        'Passionate UI/UX designer with 5+ years of experience creating user-centered digital experiences.',
    },
  };

  return {
    previewUrl: template.previewUrl,
    thumbnailUrl: template.thumbnailUrl,
    sampleData,
  };
};

// ==========================================
// PROTECTED SERVICES (Admin/Creator)
// ==========================================

/**
 * Create new template
 * @param {Object} templateData - Template data
 * @param {string} createdBy - User ID who created the template
 * @returns {Promise<Object>} Created template
 */
exports.createTemplate = async (templateData, createdBy) => {
  // Create template with createdBy reference
  const template = await Template.create({
    ...templateData,
    createdBy,
  });

  return template;
};

/**
 * Update template
 * @param {string} id - Template ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated template
 */
exports.updateTemplate = async (id, updateData) => {
  const template = await Template.findOne({ _id: id, isActive: true });

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Update fields
  Object.keys(updateData).forEach((key) => {
    template[key] = updateData[key];
  });

  await template.save();

  return template;
};

/**
 * Delete template (soft delete - set isActive: false)
 * @param {string} id - Template ID
 * @returns {Promise<void>}
 */
exports.deleteTemplate = async (id) => {
  const template = await Template.findOne({ _id: id, isActive: true });

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Soft delete
  template.isActive = false;
  await template.save();
};

/**
 * Duplicate existing template
 * @param {string} id - Template ID to duplicate
 * @param {string} description - Optional new description
 * @param {string} createdBy - User ID who duplicated the template
 * @returns {Promise<Object>} Duplicated template
 */
exports.duplicateTemplate = async (id, description, createdBy) => {
  const originalTemplate = await Template.findOne({ _id: id, isActive: true }).lean();

  if (!originalTemplate) {
    throw new AppError('Template not found', 404);
  }

  // Remove _id and timestamps from original
  const { _id, createdAt, updatedAt, usageCount, rating, ...templateData } = originalTemplate;

  // Create duplicate with reset metrics and optional new description
  const duplicatedTemplate = await Template.create({
    ...templateData,
    description: description || `${templateData.description || 'Template'} (Copy)`,
    usageCount: 0,
    rating: 0,
    createdBy,
  });

  return duplicatedTemplate;
};