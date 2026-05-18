/**
 * @file features/resume/api/resumeApi.js
 * @description Resume API service
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * Synced with backend resumeRoutes.js v3.0.0:
 * - Only routes that exist in the backend are called
 * - getAllResumes supports limit + sort query params
 * - duplicateResume supports optional title
 * - Added: updateSectionOrder, updateSectionVisibility, switchTemplate
 * - Removed: drafts, completed, title-only, visibility, download (no backend routes)
 */

import apiClient from '@/shared/lib/api/axios';

const resumeService = {
  /**
   * Get all resumes of logged-in user
   * @param {Object} [options]
   * @param {number} [options.limit=10] - 1–50
   * @param {'newest'|'oldest'|'title'} [options.sort='newest']
   * @returns {Promise<{ success, data: { resumes, total, limit } }>}
   */
  getAllResumes: ({ limit = 10, sort = 'newest' } = {}) =>
    apiClient.get('/resumes', { params: { limit, sort } }).then((r) => r.data),

  /**
   * Get single resume by ID (includes full template details)
   * @param {string} id
   * @returns {Promise<{ success, data: { resume } }>}
   */
  getResumeById: (id) => apiClient.get(`/resumes/${id}`).then((r) => r.data),

  /**
   * Create a new resume
   * @param {Object} resumeData - { templateId, title, personalInfo, ... }
   * @returns {Promise<{ success, data: { resume } }>}
   */
  createResume: (resumeData) =>
    apiClient.post('/resumes', resumeData).then((r) => r.data),

  /**
   * Partially update a resume (at least one field required)
   * @param {string} id
   * @param {Object} updateData
   * @returns {Promise<{ success, data: { resume } }>}
   */
  updateResume: (id, updateData) =>
    apiClient.patch(`/resumes/${id}`, updateData).then((r) => r.data),

  /**
   * Soft-delete a resume
   * @param {string} id
   * @returns {Promise<{ success, data: { id } }>}
   */
  deleteResume: (id) => apiClient.delete(`/resumes/${id}`).then((r) => r.data),

  /**
   * Duplicate an existing resume
   * @param {string} id
   * @param {string} [title] - Optional title for the copy
   * @returns {Promise<{ success, data: { resume } }>}
   */
  duplicateResume: (id, title) =>
    apiClient
      .post(`/resumes/${id}/duplicate`, title ? { title } : {})
      .then((r) => r.data),

  /**
   * Update section display order (drag & drop)
   * @param {string} id
   * @param {string[]} sectionOrder - Ordered array of valid section names
   * @returns {Promise<{ success, data: { resume } }>}
   */
  updateSectionOrder: (id, sectionOrder) =>
    apiClient
      .patch(`/resumes/${id}/section-order`, { sectionOrder })
      .then((r) => r.data),

  /**
   * Partially update section visibility
   * Only provided keys are affected — untouched sections keep their state
   * @param {string} id
   * @param {Object} sectionVisibility - e.g. { skills: false, summary: true }
   * @returns {Promise<{ success, data: { resume } }>}
   */
  updateSectionVisibility: (id, sectionVisibility) =>
    apiClient
      .patch(`/resumes/${id}/section-visibility`, { sectionVisibility })
      .then((r) => r.data),

  /**
   * Switch resume to a different template
   * @param {string} id
   * @param {string} templateId - 24-char MongoDB ObjectId
   * @returns {Promise<{ success, data: { resume } }>}
   */
  switchTemplate: (id, templateId) =>
    apiClient
      .patch(`/resumes/${id}/template`, { templateId })
      .then((r) => r.data),
};

export default resumeService;
