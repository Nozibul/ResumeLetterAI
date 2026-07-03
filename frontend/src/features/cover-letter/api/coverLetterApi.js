/**
 * @file features/cover-letter/api/coverLetterApi.js
 * @description Cover letter API service
 * @author Nozibul Islam
 *
 * Architecture:
 * - All cover letter API calls (except streaming generate)
 * - Uses shared axios instance
 * - Streaming generate uses native fetch (axios cannot stream)
 * - Error handling delegated to axios interceptor
 */

import apiClient from '@/shared/lib/api/axios';

const coverLetterApi = {
  /**
   * Save a generated cover letter
   * @param {string} coverLetterId
   * @returns {Promise}
   */
  save: async (coverLetterId) => {
    const response = await apiClient.post('/cover-letters/save', {
      coverLetterId,
    });
    return response.data;
  },

  /**
   * Get all saved cover letters for the current user
   * @returns {Promise}
   */
  list: async () => {
    const response = await apiClient.get('/cover-letters');
    return response.data;
  },

  /**
   * Get a single cover letter by ID
   * @param {string} id
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await apiClient.get(`/cover-letters/${id}`);
    return response.data;
  },
};

export default coverLetterApi;
