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
 */

import apiClient from '@/shared/lib/api/axios';

/**
 * Resume Service
 * All resume related API calls
 */
const resumeService = {
  /**
   * Create new resume
   * @param {Object} resumeData - { templateId, resumeTitle, content }
   * @returns {Promise} Created resume
   */
  createResume: async (resumeData) => {
    const response = await apiClient.post('/resumes', resumeData);
    return response.data;
  },

  /**
   * Get all resumes of logged-in user
   * @returns {Promise} Array of user's resumes
   */
  getAllResumes: async () => {
    const response = await apiClient.get('/resumes');
    return response.data;
  },

  /**
   * Get all draft resumes (incomplete)
   * @returns {Promise} Array of draft resumes
   */
  getDraftResumes: async () => {
    const response = await apiClient.get('/resumes/drafts');
    return response.data;
  },

  /**
   * Get all completed resumes
   * @returns {Promise} Array of completed resumes
   */
  getCompletedResumes: async () => {
    const response = await apiClient.get('/resumes/completed');
    return response.data;
  },

  /**
   * Get single resume by ID
   * @param {string} id - Resume ID
   * @returns {Promise} Resume details with template
   */
  getResumeById: async (id) => {
    const response = await apiClient.get(`/resumes/${id}`);
    return response.data;
  },

  /**
   * Update resume content
   * @param {string} id - Resume ID
   * @param {Object} updateData - { content, isCompleted }
   * @returns {Promise} Updated resume
   */
  updateResume: async (id, updateData) => {
    const response = await apiClient.patch(`/resumes/${id}`, updateData);
    return response.data;
  },

  /**
   * Update resume title only
   * @param {string} id - Resume ID
   * @param {string} resumeTitle - New title
   * @returns {Promise} Updated resume
   */
  updateResumeTitle: async (id, resumeTitle) => {
    const response = await apiClient.patch(`/resumes/${id}/title`, {
      resumeTitle,
    });
    return response.data;
  },

  /**
   * Delete resume
   * @param {string} id - Resume ID
   * @returns {Promise} Success message
   */
  deleteResume: async (id) => {
    const response = await apiClient.delete(`/resumes/${id}`);
    return response.data;
  },

  /**
   * Duplicate existing resume
   * @param {string} id - Resume ID to duplicate
   * @returns {Promise} Duplicated resume
   */
  duplicateResume: async (id) => {
    const response = await apiClient.post(`/resumes/${id}/duplicate`);
    return response.data;
  },

  /**
   * Toggle resume visibility (public/private)
   * @param {string} id - Resume ID
   * @param {boolean} isPublic - Public status
   * @returns {Promise} Updated resume
   */
  toggleVisibility: async (id, isPublic) => {
    const response = await apiClient.patch(`/resumes/${id}/visibility`, {
      isPublic,
    });
    return response.data;
  },

  /**
   * Track resume download
   * @param {string} id - Resume ID
   * @returns {Promise} Success message
   */
  trackDownload: async (id) => {
    const response = await apiClient.post(`/resumes/${id}/download`);
    return response.data;
  },
};

export default resumeService;
