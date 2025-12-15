/**
 * @file store/hooks/useTemplates.js
 * @description Custom Redux hooks for Template management
 * @author Nozibul Islam
 * 
 * Architecture:
 * - Wraps templateSelectors in hooks for convenience
 * - Provides hook-based approach for template operations
 * - Reduces boilerplate in components
 */

import { useDispatch, useSelector } from 'react-redux';
import {
  selectTemplates,
  selectAllTemplates,
  selectTemplateById,
  selectTemplatesByCategory,
  selectSelectedTemplate,
  selectCategoryStats,
  selectTemplateLoading,
  selectTemplateError,
  selectTotalTemplates,
  selectPremiumTemplates,
  selectFreeTemplates,
  selectIsTemplatesCached,
  selectFilteredTemplates,
} from '../selectors/templateSelectors'; 

// ==========================================
// BASIC HOOKS
// ==========================================

/**
 * Typed dispatch hook
 */
export const useAppDispatch = () => useDispatch();

/**
 * Typed selector hook
 */
export const useAppSelector = useSelector;

// ==========================================
// TEMPLATE HOOKS (wraps templateSelectors)
// ==========================================

/**
 * Get entire template state
 * @returns {Object} { templates, loading, error, categoryStats, selectedTemplate, lastFetched }
 */
export const useTemplates = () => {
  return useAppSelector(selectTemplates);
};

/**
 * Get all templates array
 * @returns {Array} Array of templates
 */
export const useAllTemplates = () => {
  return useAppSelector(selectAllTemplates);
};

/**
 * Get template by ID
 * @param {string} id - Template ID
 * @returns {Object|null} Template object or null
 */
export const useTemplateById = (id) => {
  return useAppSelector((state) => selectTemplateById(state, id));
};

/**
 * Get templates by category
 * @param {string} category - Template category
 * @returns {Array} Filtered templates
 */
export const useTemplatesByCategory = (category) => {
  return useAppSelector((state) => selectTemplatesByCategory(state, category));
};

/**
 * Get selected template (for details/preview)
 * @returns {Object|null} Selected template or null
 */
export const useSelectedTemplate = () => {
  return useAppSelector(selectSelectedTemplate);
};

/**
 * Get category stats (for home page)
 * @returns {Object} { corporate: 5, creative: 3, ... }
 */
export const useCategoryStats = () => {
  return useAppSelector(selectCategoryStats);
};

/**
 * Get template loading state
 * @returns {boolean} true if fetching templates
 */
export const useTemplateLoading = () => {
  return useAppSelector(selectTemplateLoading);
};

/**
 * Get template error
 * @returns {string|null} Error message or null
 */
export const useTemplateError = () => {
  return useAppSelector(selectTemplateError);
};

/**
 * Get total templates count
 * @returns {number} Total number of templates
 */
export const useTotalTemplates = () => {
  return useAppSelector(selectTotalTemplates);
};

/**
 * Get premium templates only
 * @returns {Array} Array of premium templates
 */
export const usePremiumTemplates = () => {
  return useAppSelector(selectPremiumTemplates);
};

/**
 * Get free templates only
 * @returns {Array} Array of free templates
 */
export const useFreeTemplates = () => {
  return useAppSelector(selectFreeTemplates);
};

/**
 * Check if templates are cached (within 5 minutes)
 * @returns {boolean} true if cached
 */
export const useIsTemplatesCached = () => {
  return useAppSelector(selectIsTemplatesCached);
};

/**
 * Get filtered templates by multiple criteria
 * @param {Object} filters - Filter options { category, isPremium, sortBy }
 * @returns {Array} Filtered and sorted templates
 */
export const useFilteredTemplates = (filters = {}) => {
  return useAppSelector((state) => selectFilteredTemplates(state, filters));
};