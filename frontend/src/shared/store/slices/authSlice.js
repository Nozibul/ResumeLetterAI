/**
 * @file store/slices/authSlice.js
 * @description Authentication state management
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * Design decisions:
 * - isAuthenticated = !!payload (not payload.isEmailVerified).
 *   Backend already blocks unverified users at login — if a user object
 *   arrives, it is guaranteed to be verified. Double-checking on the
 *   client adds fragility without adding security.
 * - loading/authError/operationError are NOT persisted (see persistConfig).
 * - extraReducers handles async state; manual setAuthLoading dispatches
 *   in thunks are kept only where the thunk needs finer control
 *   (e.g. logoutUser clears auth even on error).
 */

import { createSlice } from '@reduxjs/toolkit';
import {
  loginUser,
  registerUser,
  fetchCurrentUser,
  logoutUser,
  updateUserProfile,
  deleteAccountUser,
} from '../actions/authActions';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  authError: null, // login / register / session errors
  operationError: null, // update profile / delete account errors
};

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.authError = null;
    },

    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.authError = null;
      state.operationError = null;
    },

    /**
     * Called by the axios interceptor when the server returns 401.
     * Sets an error message so the UI can show "Session expired".
     */
    handleSessionExpiry: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.authError = 'Session expired. Please login again.';
      state.operationError = null;
    },

    /** Optimistic profile update — roll back if the API call fails */
    updateUserInState: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    clearAuthError: (state) => {
      state.authError = null;
    },

    clearOperationError: (state) => {
      state.operationError = null;
    },

    clearAllErrors: (state) => {
      state.authError = null;
      state.operationError = null;
    },
  },

  extraReducers: (builder) => {
    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.authError = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.authError = payload?.message ?? 'Login failed';
      });

    // registerUser
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.authError = null;
      })
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.authError = payload?.message ?? 'Registration failed';
      });

    // fetchCurrentUser
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.authError = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, { payload }) => {
        state.loading = false;
        // Only clear auth on explicit 401/403 — not on network errors.
        // The thunk sets isAuthError=true only for those status codes.
        if (payload?.isAuthError) {
          state.user = null;
          state.isAuthenticated = false;
          state.authError = payload.message;
        }
        // Network / timeout errors: leave user logged in, show nothing.
      });

    //logoutUser
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        // rootReducer resets the entire state tree on this action type.
        // This case is here only to satisfy RTK's builder pattern.
        state.loading = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        // clearAuth is dispatched inside the thunk even on error,
        // so this case is a no-op — state is already cleared.
        state.loading = false;
      });

    // updateUserProfile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.operationError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
      })
      .addCase(updateUserProfile.rejected, (state, { payload }) => {
        state.loading = false;
        state.operationError = payload ?? 'Update failed';
      });

    // deleteAccountUser
    builder
      .addCase(deleteAccountUser.pending, (state) => {
        state.loading = true;
        state.operationError = null;
      })
      .addCase(deleteAccountUser.fulfilled, (state) => {
        // rootReducer resets state on logout/fulfilled.
        // clearAuth inside the thunk handles the interim.
        state.loading = false;
      })
      .addCase(deleteAccountUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.operationError = payload ?? 'Failed to delete account';
      });
  },
});

export const {
  setUser,
  clearAuth,
  handleSessionExpiry,
  updateUserInState,
  clearAuthError,
  clearOperationError,
  clearAllErrors,
} = authSlice.actions;

export default authSlice.reducer;
