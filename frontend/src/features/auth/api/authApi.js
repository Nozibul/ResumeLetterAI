/**
 * @file authApi.js
 * @author Nozibul Islams
 */

import apiClient from "@/lib/axios";

/**
 * Auth Service
 * All authentication related API calls
 */
const authService = {
  /**
   * Register new user
   * @param {Object} userData - { fullName, email, password, confirmPassword }
   * @returns {Promise} User data and tokens
   */
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password, rememberMe }
   * @returns {Promise} User data and tokens
   */
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Resend verification email
   * @returns {Promise}
   */
  resendVerification: async () => {
    const response = await apiClient.post('/auth/resend-verification');
    return response.data;
  },

  /**
   * Logout user
   * @returns {Promise}
   */
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  /**
   * Get current user profile
   * @returns {Promise} User data
   */
  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} profileData - { fullName, preferences }
   * @returns {Promise} Updated user data
   */
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/auth/update-profile', profileData);
    return response.data;
  },

  /**
   * Change password
   * @param {Object} passwordData - { currentPassword, newPassword, confirmNewPassword }
   * @returns {Promise}
   */
  changePassword: async (passwordData) => {
    const response = await apiClient.put('/auth/change-password', passwordData);
    return response.data;
  },

  /**
   * Verify email
   * @param {string} token - Verification token
   * @returns {Promise}
   */
  verifyEmail: async (token) => {
    const response = await apiClient.post(`/auth/verify-email/${token}`);
    return response.data;
  },

  /**
   * Forgot password
   * @param {string} email - User email
   * @returns {Promise}
   */
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password
   * @param {string} token - Reset token
   * @param {Object} passwordData - { password, confirmPassword }
   * @returns {Promise}
   */
  resetPassword: async (token, passwordData) => {
    const response = await apiClient.post(`/auth/reset-password/${token}`, passwordData);
    return response.data;
  },
};

export default authService;