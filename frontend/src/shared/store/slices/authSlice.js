/**
 * @file store/slices/authSlice.js
 * @description Authentication state management (Reducer only)
 * @author Nozibul Islam
 * 
 * Architecture:
 * - Pure state management (no async logic)
 * - Selectors moved to selectors/authSelectors.js
 * - Async thunks moved to actions/authActions.js
 */

import { createSlice } from '@reduxjs/toolkit';

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  authError: null,        // Authentication errors (login, session, fetch user)
  operationError: null,   // Operation errors (update profile, delete account)
};

// ==========================================
// SLICE
// ==========================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    
    /**
     * Set user data
     */
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = action.payload?.isEmailVerified || false;
      state.authError = null;
    },

    /**
     * Set authentication status
     */
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },

    /**
     * Set loading state
     */
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },

    /**
     * Set authentication error
     */
    setAuthError: (state, action) => {
      state.authError = action.payload;
      state.loading = false;
    },

    /**
     * Set operation error
     */
    setOperationError: (state, action) => {
      state.operationError = action.payload;
      state.loading = false;
    },

    /**
     * Clear authentication error
     */
    clearAuthError: (state) => {
      state.authError = null;
    },

    /**
     * Clear operation error
     */
    clearOperationError: (state) => {
      state.operationError = null;
    },

    /**
     * Clear all errors
     */
    clearAllErrors: (state) => {
      state.authError = null;
      state.operationError = null;
    },

    /**
     * Clear auth state (logout without API call)
     */
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.authError = null;
      state.operationError = null;
      state.loading = false;
    },

    /**
     * Handle session expiry (called by axios interceptor)
     */
    handleSessionExpiry: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.authError = 'Session expired. Please login again';
      state.operationError = null;
    },

    /**
     * Update user profile in state (optimistic update)
     */
    updateUserInState: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

// ==========================================
// EXPORTS
// ==========================================

export const {
  setUser,
  setAuthenticated,
  setAuthLoading,
  setAuthError,
  setOperationError,
  clearAuthError,
  clearOperationError,
  clearAllErrors,
  clearAuth,
  handleSessionExpiry,
  updateUserInState,
} = authSlice.actions;

export default authSlice.reducer;