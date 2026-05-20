/**
 * @file features/resume/api/resumeApi.js
 * @description Resume API service
 * @author Nozibul Islam
 *
 * Architecture:
 * - All resume-related API calls
 * - Uses shared axios instance (auto token handling)
 * - Error handling delegated to axios interceptor
 * - Protected routes (authentication required)
 *
 * v2.0.0 — Synced with backend resumeRoutes.js:
 * - Removed non-existent routes: drafts, completed, title, visibility, download
 * - getAllResumes: added limit + sort query param support
 * - duplicateResume: added optional title param
 * - Added missing: getStats, updateSectionOrder,
 *   updateSectionVisibility, switchTemplate
 */

import apiClient from '@/shared/lib/api/axios';

const resumeService = {
  /**
   * Get all resumes of logged-in user
   * @param {Object} options
   * @param {number} [options.limit=10] - 1–50
   * @param {'newest'|'oldest'|'title'} [options.sort='newest']
   * @returns {Promise} { resumes, total, limit }
   */
  getAllResumes: async ({ limit = 10, sort = 'newest' } = {}) => {
    const response = await apiClient.get('/resumes', {
      params: { limit, sort },
    });
    return response.data;
  },

  /**
   * Get single resume by ID
   * @param {string} id - Resume ID
   * @returns {Promise} Resume with full template details
   */
  getResumeById: async (id) => {
    const response = await apiClient.get(`/resumes/${id}`);
    return response.data;
  },

  /**
   * Create new resume
   * @param {Object} resumeData - { templateId, title, personalInfo, ... }
   * @returns {Promise} Created resume
   */
  createResume: async (resumeData) => {
    const response = await apiClient.post('/resumes', resumeData);
    return response.data;
  },

  /**
   * Partially update a resume (at least one field required)
   * @param {string} id - Resume ID
   * @param {Object} updateData - Any subset of resume fields
   * @returns {Promise} Updated resume
   */
  updateResume: async (id, updateData) => {
    const response = await apiClient.patch(`/resumes/${id}`, updateData);
    return response.data;
  },

  /**
   * Soft-delete a resume
   * @param {string} id - Resume ID
   * @returns {Promise} { id }
   */
  deleteResume: async (id) => {
    const response = await apiClient.delete(`/resumes/${id}`);
    return response.data;
  },

  /**
   * Duplicate an existing resume
   * @param {string} id - Resume ID to duplicate
   * @param {string} [title] - Optional title for the duplicate
   * @returns {Promise} Duplicated resume
   */
  duplicateResume: async (id, title) => {
    const response = await apiClient.post(`/resumes/${id}/duplicate`, {
      ...(title && { title }),
    });
    return response.data;
  },

  /**
   * Get aggregated resume statistics for the logged-in user
   * @returns {Promise} { totalResumes, completedResumes, averageCompletion }
   */
  getStats: async () => {
    const response = await apiClient.get('/resumes/stats');
    return response.data;
  },

  /**
   * Update section display order (drag & drop)
   * @param {string} id - Resume ID
   * @param {string[]} sectionOrder - Ordered array of section names
   * @returns {Promise} Updated resume
   */
  updateSectionOrder: async (id, sectionOrder) => {
    const response = await apiClient.patch(`/resumes/${id}/section-order`, {
      sectionOrder,
    });
    return response.data;
  },

  /**
   * Toggle visibility of one or more sections (partial update)
   * @param {string} id - Resume ID
   * @param {Object} sectionVisibility - e.g. { skills: false, summary: true }
   * @returns {Promise} Updated resume
   */
  updateSectionVisibility: async (id, sectionVisibility) => {
    const response = await apiClient.patch(
      `/resumes/${id}/section-visibility`,
      { sectionVisibility }
    );
    return response.data;
  },

  /**
   * Switch resume to a different template
   * @param {string} id - Resume ID
   * @param {string} templateId - New template ID (24-char ObjectId)
   * @returns {Promise} Updated resume
   */
  switchTemplate: async (id, templateId) => {
    const response = await apiClient.patch(`/resumes/${id}/template`, {
      templateId,
    });
    return response.data;
  },
};

export default resumeService;
