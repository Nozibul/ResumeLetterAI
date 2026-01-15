/**
 * @file cacheHelper.js
 * @description Redis cache helper with TTL management
 * @module config/cacheHelper
 */

const {
  getCache,
  setCache,
  deleteCache,
  clearCacheByPattern,
} = require('./redis');
const { logger } = require('../utils/logger');

// ==========================================
// CACHE KEY PATTERNS
// ==========================================
const CACHE_KEYS = {
  ALL_TEMPLATES: (category) =>
    category ? `templates:all:${category}` : 'templates:all',
  TEMPLATE_BY_ID: (id) => `templates:id:${id}`,
  CATEGORY_STATS: 'templates:stats:categories',
  TEMPLATE_PREVIEW: (id) => `templates:preview:${id}`,
};

// ==========================================
// TTL CONFIGURATION (in seconds)
// ==========================================
const CACHE_TTL = {
  TEMPLATES_LIST: 200, // 3+ minutes
  SINGLE_TEMPLATE: 200, // 5 minutes
  CATEGORY_STATS: 200, // 3+ minutes
  TEMPLATE_PREVIEW: 200, // 5 minutes
};

// ==========================================
// CACHE OPERATIONS
// ==========================================

/**
 * Get cached templates list
 */
exports.getCachedTemplates = async (category) => {
  try {
    const key = CACHE_KEYS.ALL_TEMPLATES(category);
    return await getCache(key);
  } catch (error) {
    logger.error({ type: 'cache_get_error', key, error: error.message });
    return null;
  }
};

/**
 * Set templates list in cache
 */
exports.setCachedTemplates = async (templates, category) => {
  try {
    const key = CACHE_KEYS.ALL_TEMPLATES(category);
    await setCache(key, templates, CACHE_TTL.TEMPLATES_LIST);
  } catch (error) {
    logger.error({ type: 'cache_set_error', key, error: error.message });
  }
};

/**
 * Get cached single template
 */
exports.getCachedTemplate = async (id) => {
  try {
    const key = CACHE_KEYS.TEMPLATE_BY_ID(id);
    return await getCache(key);
  } catch (error) {
    logger.error({ type: 'cache_get_error', key, error: error.message });
    return null;
  }
};

/**
 * Set single template in cache
 */
exports.setCachedTemplate = async (template) => {
  try {
    const key = CACHE_KEYS.TEMPLATE_BY_ID(template._id);
    await setCache(key, template, CACHE_TTL.SINGLE_TEMPLATE);
  } catch (error) {
    logger.error({ type: 'cache_set_error', key, error: error.message });
  }
};

/**
 * Get cached category stats
 */
exports.getCachedCategoryStats = async () => {
  try {
    return await getCache(CACHE_KEYS.CATEGORY_STATS);
  } catch (error) {
    logger.error({
      type: 'cache_get_error',
      key: 'category_stats',
      error: error.message,
    });
    return null;
  }
};

/**
 * Set category stats in cache
 */
exports.setCachedCategoryStats = async (stats) => {
  try {
    await setCache(CACHE_KEYS.CATEGORY_STATS, stats, CACHE_TTL.CATEGORY_STATS);
  } catch (error) {
    logger.error({
      type: 'cache_set_error',
      key: 'category_stats',
      error: error.message,
    });
  }
};

/**
 * Get cached template preview
 */
exports.getCachedTemplatePreview = async (id) => {
  try {
    const key = CACHE_KEYS.TEMPLATE_PREVIEW(id);
    return await getCache(key);
  } catch (error) {
    logger.error({ type: 'cache_get_error', key, error: error.message });
    return null;
  }
};

/**
 * Set template preview in cache
 */
exports.setCachedTemplatePreview = async (id, preview) => {
  try {
    const key = CACHE_KEYS.TEMPLATE_PREVIEW(id);
    await setCache(key, preview, CACHE_TTL.TEMPLATE_PREVIEW);
  } catch (error) {
    logger.error({ type: 'cache_set_error', key, error: error.message });
  }
};

// ==========================================
// CACHE INVALIDATION
// ==========================================

/**
 * Clear all template caches
 */
exports.clearAllTemplateCache = async () => {
  try {
    await clearCacheByPattern('templates:*');
    logger.info({ type: 'cache_cleared', pattern: 'templates:*' });
  } catch (error) {
    logger.error({ type: 'cache_clear_error', error: error.message });
  }
};

/**
 * Clear specific template cache
 */
exports.clearTemplateCache = async (id) => {
  try {
    await deleteCache(CACHE_KEYS.TEMPLATE_BY_ID(id));
    await deleteCache(CACHE_KEYS.TEMPLATE_PREVIEW(id));
    logger.info({ type: 'cache_cleared', templateId: id });
  } catch (error) {
    logger.error({
      type: 'cache_clear_error',
      templateId: id,
      error: error.message,
    });
  }
};

/**
 * Clear templates list cache (all categories)
 */
exports.clearTemplatesListCache = async () => {
  try {
    await clearCacheByPattern('templates:all*');
    await deleteCache(CACHE_KEYS.CATEGORY_STATS);
    logger.info({ type: 'cache_cleared', pattern: 'templates:all*' });
  } catch (error) {
    logger.error({ type: 'cache_clear_error', error: error.message });
  }
};
