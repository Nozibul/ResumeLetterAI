/**
 * @file authApi.js
 * @author Nozibul Islam
 * @description Authentication service with selective request deduplication
 * Deduplication applied only to critical operations that could cause issues if duplicated
 */

import apiClient from "@/lib/axios";

// Request cache to prevent duplicate concurrent requests
const pendingRequests = new Map();

/**
 * Deduplicate concurrent requests with same key
 * Prevents accidental double-clicks and network retries for critical operations
 * @param {string} key - Unique identifier for the request
 * @param {Function} requestFn - The actual API call function
 * @returns {Promise} Cached or new request promise
 */
const deduplicateRequest = (key, requestFn) => {
  // Return existing promise if request is already in progress
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  // Create and cache new request promise
  const requestPromise = requestFn().finally(() => {
    // Auto-cleanup after request completes
    // Increased timeout for slow networks (5 seconds)
    setTimeout(() => {
      pendingRequests.delete(key);
    }, 5000);
  });

  pendingRequests.set(key, requestPromise);
  return requestPromise;
};

/**
 * Auth Service
 * All authentication related API calls
 */
const authService = {
  /**
   * Register new user
   * ✅ DEDUPLICATION: Critical - prevents duplicate account creation
   * @param {Object} userData - { fullName, email, password, confirmPassword }
   * @returns {Promise} User data and tokens
   */
  register: async (userData) => {
    return deduplicateRequest(`register:${userData.email}`, async () => {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    });
  },

  /**
   * Login user
   * ❌ NO DEDUPLICATION: Backend handles rate limiting, button disable sufficient
   * @param {Object} credentials - { email, password, rememberMe }
   * @returns {Promise} User data and tokens
   */
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Resend verification email
   * ❌ NO DEDUPLICATION: User may intentionally want multiple emails
   * Backend should handle rate limiting (cooldown period)
   * @returns {Promise}
   */
  resendVerification: async () => {
    const response = await apiClient.post('/auth/resend-verification');
    return response.data;
  },

  /**
   * Forgot password
   * ✅ DEDUPLICATION: Critical - prevents email spam to user
   * @param {string} email - User email
   * @returns {Promise}
   */
  forgotPassword: async (email) => {
    return deduplicateRequest(`forgot-password:${email}`, async () => {
      const response = await apiClient.post('/token/forgot-password', { email });
      return response.data;
    });
  },

  /**
   * Reset password
   * ✅ DEDUPLICATION: Critical - token can only be used once, avoid confusion
   * @param {string} token - Reset token
   * @param {Object} passwordData - { password, confirmPassword }
   * @returns {Promise}
   */
  resetPassword: async (token, passwordData) => {
    return deduplicateRequest(`reset-password:${token}`, async () => {
      const response = await apiClient.post(`/token/reset-password/${token}`, passwordData);
      return response.data;
    });
  },

  /**
   * Verify email
   * ❌ NO DEDUPLICATION: One-time token link, rarely double-clicked
   * @param {string} token - Verification token
   * @returns {Promise}
   */
  verifyEmail: async (token) => {
    const response = await apiClient.get(`/token/verify-email/${token}`);
    return response.data;
  },

  /**
   * Change password
   * ❌ NO DEDUPLICATION: Infrequent operation, button disable sufficient
   * @param {Object} passwordData - { currentPassword, newPassword, confirmNewPassword }
   * @returns {Promise}
   */
  changePassword: async (passwordData) => {
    const response = await apiClient.put('/auth/change-password', passwordData);
    return response.data;
  },

  /**
   * Update user profile
   * ❌ NO DEDUPLICATION: Use debouncing instead for auto-save scenarios
   * @param {Object} profileData - { fullName, preferences }
   * @returns {Promise} Updated user data
   */
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/auth/update-profile', profileData);
    return response.data;
  },

  /**
   * Logout user
   * ❌ NO DEDUPLICATION: Safe to call multiple times, idempotent operation
   * @returns {Promise}
   */
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  /**
   * Get current user profile
   * ❌ NO DEDUPLICATION: Read-only operation, no side effects
   * @returns {Promise} User data
   */
  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default authService;