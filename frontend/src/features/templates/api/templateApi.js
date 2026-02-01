/**
 * @file features/templates/api/templateApi.js
 * @description Template API service
 * @author Nozibul Islam
 *
 * Architecture:
 * - All template-related API calls
 * - Uses shared axios instance
 * - Error handling delegated to axios interceptor
 * - No deduplication (read operations, safe to retry)
 */

import apiClient from '@/shared/lib/api/axios';

/**
 * Template Service
 * All template related API calls
 */
const templateService = {
  /**
   * Get all templates (with optional category filter)
   * @param {string} category - Optional category filter
   * @returns {Promise} Templates array
   */
  getAllTemplates: async (category) => {
    const url = category ? `/templates?category=${category}` : '/templates';
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Get template by ID
   * @param {string} id - Template ID
   * @returns {Promise} Template details with full structure
   */
  getTemplateById: async (id) => {
    const response = await apiClient.get(`/templates/${id}`);
    return response.data;
  },

  /**
   * Get template preview
   * @param {string} id - Template ID
   * @returns {Promise} Preview URLs and sample data
   */
  getTemplatePreview: async (id) => {
    const response = await apiClient.get(`/templates/${id}/preview`);
    return response.data;
  },

  /**
   * Get category statistics (for home page)
   * @returns {Promise} Category-wise template count
   */
  getCategoryStats: async () => {
    const response = await apiClient.get('/templates/categories/stats');
    return response.data;
  },

  /**
   * Create new template (Admin only)
   * @param {Object} templateData - Template data
   * @returns {Promise} Created template
   */
  createTemplate: async (templateData) => {
    const response = await apiClient.post('/templates', templateData);
    return response.data;
  },

  /**
   * Update template (Admin only)
   * @param {string} id - Template ID
   * @param {Object} updateData - Updated template data
   * @returns {Promise} Updated template
   */
  updateTemplate: async (id, updateData) => {
    const response = await apiClient.patch(`/templates/${id}`, updateData);
    return response.data;
  },

  /**
   * Delete template (Admin only)
   * @param {string} id - Template ID
   * @returns {Promise} Success message
   */
  deleteTemplate: async (id) => {
    const response = await apiClient.delete(`/templates/${id}`);
    return response.data;
  },

  /**
   * Duplicate template (Admin only)
   * @param {string} id - Template ID to duplicate
   * @param {string} description - Optional new description
   * @returns {Promise} Duplicated template
   */
  duplicateTemplate: async (id, description) => {
    const response = await apiClient.post(`/templates/${id}/duplicate`, {
      description,
    });
    return response.data;
  },
};

export default templateService;
