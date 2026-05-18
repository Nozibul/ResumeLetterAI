/**
 * @file store/actions/authActions.js
 * @description Authentication async thunks
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * Design decisions:
 * - No manual setAuthLoading dispatch — loading state lives in extraReducers.
 * - fetchCurrentUser: 401/403 → logout (session gone).
 *   Network / timeout errors → do NOT logout (user is just offline).
 *   The rejected payload carries { isAuthError: true } as a flag so the
 *   slice can tell the two cases apart.
 * - logoutUser: error from API is intentionally swallowed. Cookie may already
 *   be gone; the only important thing is clearing local state and storage.
 *   persistor.purge() clears localStorage.
 * - deleteAccountUser dispatches logoutUser after success so rootReducer
 *   resets the full state tree via 'auth/logout/fulfilled'.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from '@/features/auth/api/authApi';
import { clearAuth } from '../slices/authSlice';
import { persistor } from '../index';

const rejectMsg = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

// ── Register ──────────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await authService.register(userData);
      return res.data.user;
    } catch (err) {
      return rejectWithValue({
        status: err.response?.status,
        message: rejectMsg(err, 'Registration failed'),
      });
    }
  }
);

// ── Login ─────────────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authService.login(credentials);
      return res.data.user;
    } catch (err) {
      return rejectWithValue({
        status: err.response?.status,
        message: rejectMsg(err, 'Login failed'),
        // Pass field-level validation errors if backend sends them
        data: err.response?.data?.data ?? null,
      });
    }
  }
);

//Fetch current user

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.getProfile();
      return res.data.user;
    } catch (err) {
      const status = err.response?.status;

      // 401 Unauthorized / 403 Forbidden = session is gone → logout
      if (status === 401 || status === 403) {
        return rejectWithValue({
          isAuthError: true,
          message: 'Session expired. Please login again.',
        });
      }

      // Network error, timeout, 500, etc. → stay logged in, fail silently
      return rejectWithValue({
        isAuthError: false,
        message: rejectMsg(err, 'Failed to fetch user'),
      });
    }
  }
);

// Logout

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await authService.logout();
    } catch {
      // API error is intentionally ignored.
      // Cookie may already be gone; local cleanup is what matters.
    } finally {
      dispatch(clearAuth());
      // Clear persisted auth from localStorage
      persistor.purge();
    }
    return null;
  }
);

// Update profile

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await authService.updateProfile(profileData);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, 'Update failed'));
    }
  }
);

// Delete account

export const deleteAccountUser = createAsyncThunk(
  'auth/deleteAccount',
  async (passwordData, { dispatch, rejectWithValue }) => {
    try {
      await authService.deleteAccount(passwordData.password);
      // Reuse logout flow to reset full state tree and clear storage
      dispatch(logoutUser());
      return null;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, 'Failed to delete account'));
    }
  }
);
