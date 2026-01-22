/**
 * @file TemplateService.js
 * @description Template service with Redis cache and IT/ATS support
 * @module modules/template/services/TemplateService
 * @author Nozibul Islam
 * @version 2.0.0
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
 * @param {string} category - Optional category filter
 * @returns {Promise<Array>} Templates list
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
 * @returns {Promise<Object>} Category statistics
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

  // Transform to object format: { "corporate": 5, "it": 3, ... }
  const result = stats.reduce((acc, item) => {
    acc[item.category] = item.count;
    return acc;
  }, {});

  // Store in cache
  await cacheHelper.setCachedCategoryStats(result);

  return result;
};

/**
 * Get template by ID (with Redis cache and applied defaults)
 * @param {string} id - Template ID
 * @returns {Promise<Object>} Template with defaults applied
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
 * @param {string} id - Template ID
 * @returns {Promise<Object>} Preview data with sample content
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
    .select('previewUrl thumbnailUrl category settings')
    .lean();

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Sample data based on category
  const isITTemplate =
    template.category === 'it' || template.category === 'ats-friendly';

  const sampleData = isITTemplate
    ? {
        header: {
          fullName: 'MD. NOZIBUL ISLAM',
          position: 'Full-Stack Developer',
          email: 'developer@example.com',
          phone: '+8801234567890',
          location: 'Dhaka, Bangladesh',
          linkedin: 'linkedin.com/in/developer',
          github: 'github.com/developer',
          portfolio: 'portfolio.dev',
        },
        summary: {
          text: 'Software Engineer with 3+ years of experience in designing, developing, and deploying scalable full-stack web applications.',
        },
        skills: {
          programmingLanguages: ['JavaScript', 'TypeScript', 'Python'],
          frontend: ['React.js', 'Next.js', 'Tailwind CSS'],
          backend: ['Node.js', 'Express.js', 'MongoDB'],
        },
      }
    : {
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
    settings: template.settings || null,
    sampleData,
  };

  // Store in cache
  await cacheHelper.setCachedTemplatePreview(id, preview);

  return preview;
};

/**
 * Get IT/ATS templates only
 * @param {number} limit - Optional limit
 * @returns {Promise<Array>} IT/ATS templates
 */
exports.getITTemplates = async (limit = 0) => {
  const cacheKey = `it_templates_${limit}`;

  // Try cache first
  const cached = await cacheHelper.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from DB
  const templates = await Template.getITTemplates(limit);

  // Store in cache (30 minutes)
  await cacheHelper.set(cacheKey, JSON.stringify(templates), 1800);

  return templates;
};

// ==========================================
// PROTECTED SERVICES (WITH CACHE INVALIDATION)
// ==========================================

/**
 * Create template (clear cache after)
 * @param {Object} templateData - Template data
 * @param {string} createdBy - User ID
 * @returns {Promise<Object>} Created template
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
 * @param {string} id - Template ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated template
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
    'settings',
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
 * Get all soft-deleted templates
 * @returns {Promise<Array>} Soft-deleted templates
 */
exports.getSoftDeletedTemplates = async () => {
  const templates = await Template.find({ isActive: false })
    .select('-structure -__v')
    .sort({ updatedAt: -1 })
    .lean();

  return templates;
};

/**
 * Restore soft-deleted template
 * @param {string} id - Template ID
 * @returns {Promise<Object>} Restored template
 */
exports.restoreTemplate = async (id) => {
  validateObjectId(id);

  const template = await Template.findOne({ _id: id, isActive: false });

  if (!template) {
    throw new AppError('Template not found or already active', 404);
  }

  // Restore template
  template.isActive = true;
  await template.save();

  // Clear cache
  await cacheHelper.clearTemplateCache(id);
  await cacheHelper.clearTemplatesListCache();

  return template;
};

/**
 * Permanently delete template from database
 * @param {string} id - Template ID
 */
exports.permanentDeleteTemplate = async (id) => {
  validateObjectId(id);

  const template = await Template.findById(id);

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Hard delete from database
  await Template.findByIdAndDelete(id);

  // Clear cache
  await cacheHelper.clearTemplateCache(id);
  await cacheHelper.clearTemplatesListCache();
};

/**
 * Soft Delete template (clear cache after)
 * @param {string} id - Template ID
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
 * @param {string} id - Template ID
 * @param {string} description - New description
 * @param {string} createdBy - User ID
 * @returns {Promise<Object>} Duplicated template
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
  const { _id, createdAt, updatedAt, usageCount, rating, ...templateData } =
    originalTemplate;

  // Create duplicate with reset metrics
  const duplicatedTemplate = await Template.create({
    ...templateData,
    description:
      description || `${templateData.description || 'Template'} (Copy)`,
    usageCount: 0,
    rating: 0,
    createdBy,
  });

  // Clear templates list cache
  await cacheHelper.clearTemplatesListCache();

  return duplicatedTemplate;
};
