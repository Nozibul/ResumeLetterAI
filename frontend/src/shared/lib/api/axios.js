/**
 * @file shared/lib/api/axios.js
 * @description Axios instance with automatic token refresh on 401
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * Auth model: httpOnly cookie (backend managed).
 * No token is read or written on the client — cookies are sent automatically
 * by the browser on every request (withCredentials: true).
 *
 * Refresh flow:
 *   1. Any request → 401
 *   2. POST /token/refresh-token (cookie sent automatically)
 *   3a. Success → retry original request + flush queued requests
 *   3b. Failure → dispatch handleSessionExpiry, redirect to /login
 *
 * Concurrency:
 *   While a refresh is in-flight, subsequent 401s are queued.
 *   On refresh success/failure the queue is flushed in one pass.
 */

import axios from 'axios';

// ── Instance

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  withCredentials: true, // send httpOnly cookies on every request
  headers: { 'Content-Type': 'application/json' },
});

// ── Refresh state

let isRefreshing = false;

/**
 * Each entry is { resolve, reject } for a Promise that is blocking
 * a retried request while a refresh is in-flight.
 * @type {{ resolve: Function, reject: Function }[]}
 */
let failedQueue = [];

/**
 * Flush all queued requests.
 * @param {Error|null} error - If set, every queued promise is rejected.
 */
const flushQueue = (error = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

// ── Session expiry helper

/**
 * Dispatch handleSessionExpiry and redirect to login.
 * Lazy-imported to avoid a circular dependency with the store.
 */
const expireSession = async () => {
  try {
    const [{ store }, { handleSessionExpiry }] = await Promise.all([
      import('@/shared/store'),
      import('@/shared/store/slices/authSlice'),
    ]);
    store.dispatch(handleSessionExpiry());
  } catch {
    // If the import fails for any reason, still redirect.
  }

  if (typeof window !== 'undefined') {
    window.location.href = '/login?reason=session_expired';
  }
};

// ── Request interceptor

apiClient.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`→ ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor

apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`← ${response.status} ${response.config.url}`);
    }
    return response;
  },

  async (error) => {
    const { response, config: originalRequest } = error;
    const status = response?.status;

    // ── Non-401: pass through
    if (status !== 401) {
      if (process.env.NODE_ENV === 'development' && status >= 500) {
        console.error(`← ${status} ${originalRequest?.url}`, response?.data);
      }
      return Promise.reject(error);
    }

    // ── 401 on the refresh endpoint itself: session is gone
    if (originalRequest?.url?.includes('/token/refresh-token')) {
      await expireSession();
      return Promise.reject(error);
    }

    // ── 401 after already retrying: refresh succeeded but request still fails ─
    if (originalRequest?._retry) {
      await expireSession();
      return Promise.reject(error);
    }

    // ── First 401: attempt token refresh
    originalRequest._retry = true;

    // Queue this request if a refresh is already running
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => apiClient(originalRequest));
    }

    isRefreshing = true;

    try {
      // Cookie is sent automatically — no token handling needed on the client
      await apiClient.post('/token/refresh-token');

      flushQueue();
      return apiClient(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError);
      await expireSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
