/**
 * @file TemplateService.js (Updated with Redis Cache)
 */

const mongoose = require('mongoose');
const Template = require('../models/Template');
const AppError = require('../../../shared/utils/AppError');
const cacheHelper = require('../../../shared/config/cacheHelper');

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @throws {AppError} If invalid ID
 */
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid template ID format', 400);
  }
};

// ==========================================
// PUBLIC SERVICES (WITH CACHE)
// ==========================================

/**
 * Get all templates (with Redis cache)
 */
exports.getAllTemplates = async (category) => {
  // Try cache first
  const cached = await cacheHelper.getCachedTemplates(category);
  if (cached) {
    return cached;
  }

  // If not in cache, fetch from DB
  const query = { isActive: true };

  if (category) {
    query.category = category;
  }

  const templates = await Template.find(query)
    .select('-structure -__v')
    .sort({ usageCount: -1, rating: -1, createdAt: -1 })
    .lean();

  // Store in cache for future requests
  await cacheHelper.setCachedTemplates(templates, category);

  return templates;
};

/**
 * Get category stats (with Redis cache)
 */
exports.getCategoryStats = async () => {
  // Try cache first
  const cached = await cacheHelper.getCachedCategoryStats();
  if (cached) {
    return cached;
  }

  // If not in cache, fetch from DB
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
  const result = stats.reduce((acc, item) => {
    acc[item.category] = item.count;
    return acc;
  }, {});

  // Store in cache
  await cacheHelper.setCachedCategoryStats(result);

  return result;
};

/**
 * Get template by ID (with Redis cache)
 */
exports.getTemplateById = async (id) => {
  validateObjectId(id);

  // Try cache first
  const cached = await cacheHelper.getCachedTemplate(id);
  if (cached) {
    return cached;
  }

  // If not in cache, fetch from DB
  const template = await Template.findOne({ _id: id, isActive: true })
    .select('-__v')
    .lean();

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Store in cache
  await cacheHelper.setCachedTemplate(template);

  return template;
};

/**
 * Get template preview (with Redis cache)
 */
exports.getTemplatePreview = async (id) => {
  validateObjectId(id);

  // Try cache first
  const cached = await cacheHelper.getCachedTemplatePreview(id);
  if (cached) {
    return cached;
  }

  // If not in cache, fetch from DB
  const template = await Template.findOne({ _id: id, isActive: true })
    .select('previewUrl thumbnailUrl category')
    .lean();

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Sample data for preview
  const sampleData = {
    header: {
      fullName: 'ANNA COEHLO',
      position: 'UI/UX Designer',
      email: 'anna.coehlo@example.com',
      phone: '+1 234 567 8900',
      location: 'New York, USA',
    },
    profile: {
      summary: 'Passionate UI/UX designer with 5+ years of experience.',
    },
  };

  const preview = {
    previewUrl: template.previewUrl,
    thumbnailUrl: template.thumbnailUrl,
    category: template.category,
    sampleData,
  };

  // Store in cache
  await cacheHelper.setCachedTemplatePreview(id, preview);

  return preview;
};

// ==========================================
// PROTECTED SERVICES (WITH CACHE INVALIDATION)
// ==========================================

/**
 * Create template (clear cache after)
 */
exports.createTemplate = async (templateData, createdBy) => {
  const template = await Template.create({
    ...templateData,
    createdBy,
  });

  // Clear templates list cache
  await cacheHelper.clearTemplatesListCache();

  return template;
};

/**
 * Update template (clear cache after)
 */
exports.updateTemplate = async (id, updateData) => {
  validateObjectId(id);

  const template = await Template.findOne({ _id: id, isActive: true });

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Whitelist allowed fields for update
  const allowedFields = [
    'category',
    'description',
    'previewUrl',
    'thumbnailUrl',
    'tags',
    'isPremium',
    'structure',
    'isActive',
  ];

  // Filter and update only allowed fields
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      template[field] = updateData[field];
    }
  });

  await template.save();

  // Clear cache for this template
  await cacheHelper.clearTemplateCache(id);
  await cacheHelper.clearTemplatesListCache();

  return template;
};

/**
 * Delete template (clear cache after)
 */
exports.deleteTemplate = async (id) => {
  validateObjectId(id);

  const template = await Template.findOne({ _id: id, isActive: true });

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Soft delete
  template.isActive = false;
  await template.save();

  // Clear cache
  await cacheHelper.clearTemplateCache(id);
  await cacheHelper.clearTemplatesListCache();
};

/**
 * Duplicate template (clear cache after)
 */
exports.duplicateTemplate = async (id, description, createdBy) => {
  validateObjectId(id);

  const originalTemplate = await Template.findOne({ _id: id, isActive: true })
    .select('-__v')
    .lean();

  if (!originalTemplate) {
    throw new AppError('Template not found', 404);
  }

  // Remove _id and metadata from original
  const { _id, createdAt, updatedAt, usageCount, rating, ...templateData } = originalTemplate;

  // Create duplicate with reset metrics
  const duplicatedTemplate = await Template.create({
    ...templateData,
    description: description || `${templateData.description || 'Template'} (Copy)`,
    usageCount: 0,
    rating: 0,
    createdBy,
  });

  // Clear templates list cache
  await cacheHelper.clearTemplatesListCache();

  return duplicatedTemplate;
};