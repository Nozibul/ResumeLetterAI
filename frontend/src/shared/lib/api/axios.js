/**
 * @file api/axios.js
 * @description Axios instance with automatic token refresh on 401
 * @author Nozibul Islam
 * 
 * Features:
 * - Automatic refresh token on 401
 * - Request retry after token refresh
 * - Logout on refresh failure
 * - Request/Response logging in development
 */

import axios from 'axios';

// ==========================================
// BASE CONFIGURATION
// ==========================================

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// REFRESH TOKEN STATE
// ==========================================

let isRefreshing = false;
let failedQueue = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================

apiClient.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR (Token Refresh Logic)
// ==========================================

apiClient.interceptors.response.use(
  (response) => {
    // Success response - just return
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.url}`, response.status);
    }
    return response;
  },
  
  async (error) => {
    const originalRequest = error.config;

    // ==========================================
    // CASE 1: Not a 401 error - just reject
    // ==========================================
    if (error.response?.status !== 401) {
      // Only log server errors (500+), not client errors (400-499)
      if (process.env.NODE_ENV === 'development' && error.response?.status >= 500) {
        console.error(`❌ API Error (${error.response?.status}):`, error.response?.data);
      }
      return Promise.reject(error);
    }

    // ==========================================
    // CASE 2: 401 on refresh endpoint - logout
    // ==========================================
    if (originalRequest.url?.includes('/token/refresh-token')) {
      
      // Lazy import to avoid circular dependency
      const { store } = await import('@/shared/store');
      const { handleSessionExpiry } = await import('@/shared/store/slices/authSlice');
      
      store.dispatch(handleSessionExpiry());
      
      // Redirect to login (client-side)
      if (typeof window !== 'undefined') {
        window.location.href = '/login?reason=session_expired';
      }
      
      return Promise.reject(error);
    }

    // ==========================================
    // CASE 3: Already retried - logout
    // ==========================================
    if (originalRequest._retry) {      
      // Lazy import to avoid circular dependency
      const { store } = await import('@/shared/store');
      const { handleSessionExpiry } = await import('@/shared/store/slices/authSlice');
      
      store.dispatch(handleSessionExpiry());
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login?reason=session_expired';
      }
      
      return Promise.reject(error);
    }

    // ==========================================
    // CASE 4: First 401 - Try token refresh
    // ==========================================
    
    // Mark request as retried
    originalRequest._retry = true;

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          return apiClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Start refresh process
    isRefreshing = true;

    try {
      // Call refresh token endpoint
      const response = await apiClient.post('/token/refresh-token');

      if (response.data.success) {        
        // Process queued requests
        processQueue(null, response.data.data.accessToken);
        
        // Retry original request
        return apiClient(originalRequest);
      }
    } catch (refreshError) {      
      // Process queue with error
      processQueue(refreshError, null);
      
      // Lazy import to avoid circular dependency
      const { store } = await import('@/shared/store');
      const { handleSessionExpiry } = await import('@/shared/store/slices/authSlice');
      
      store.dispatch(handleSessionExpiry());
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login?reason=session_expired';
      }
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;