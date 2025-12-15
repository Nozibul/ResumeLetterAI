/**
 * @file store/selectors/templateSelectors.js
 * @description Template state selectors
 * @author Nozibul Islam
 * 
 * Architecture:
 * - All template-related selectors
 * - Memoization for performance
 * - Reusable across components
 */

/**
 * Get entire template state
 */
export const selectTemplates = (state) => state.template;

/**
 * Get all templates array
 */
export const selectAllTemplates = (state) => state.template.templates;

/**
 * Get template by ID
 */
export const selectTemplateById = (state, id) => {
  return state.template.templates.find((template) => template._id === id);
};

/**
 * Get templates by category
 */
export const selectTemplatesByCategory = (state, category) => {
  if (!category) return state.template.templates;
  return state.template.templates.filter((template) => template.category === category);
};

/**
 * Get selected template
 */
export const selectSelectedTemplate = (state) => state.template.selectedTemplate;

/**
 * Get category stats
 */
export const selectCategoryStats = (state) => state.template.categoryStats;

/**
 * Get loading state
 */
export const selectTemplateLoading = (state) => state.template.loading;

/**
 * Get error
 */
export const selectTemplateError = (state) => state.template.error;

/**
 * Get total templates count
 */
export const selectTotalTemplates = (state) => state.template.templates.length;

/**
 * Get premium templates
 */
export const selectPremiumTemplates = (state) => {
  return state.template.templates.filter((template) => template.isPremium);
};

/**
 * Get free templates
 */
export const selectFreeTemplates = (state) => {
  return state.template.templates.filter((template) => !template.isPremium);
};

/**
 * Check if templates are cached (within 5 minutes)
 */
export const selectIsTemplatesCached = (state) => {
  const lastFetched = state.template.lastFetched;
  if (!lastFetched) return false;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  return Date.now() - lastFetched < CACHE_DURATION;
};

/**
 * Get templates by multiple filters
 */
export const selectFilteredTemplates = (state, filters = {}) => {
  let templates = state.template.templates;

  // Filter by category
  if (filters.category) {
    templates = templates.filter((t) => t.category === filters.category);
  }

  // Filter by premium status
  if (filters.isPremium !== undefined) {
    templates = templates.filter((t) => t.isPremium === filters.isPremium);
  }

  // Sort by criteria
  if (filters.sortBy === 'popular') {
    templates = [...templates].sort((a, b) => b.usageCount - a.usageCount);
  } else if (filters.sortBy === 'rating') {
    templates = [...templates].sort((a, b) => b.rating - a.rating);
  } else if (filters.sortBy === 'newest') {
    templates = [...templates].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return templates;
};