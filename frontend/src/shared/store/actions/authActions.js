/**
 * @file store/actions/authActions.js
 * @description Authentication async actions (thunks)
 * @author Nozibul Islam
 * 
 * Architecture:
 * - All async auth operations
 * - API calls via authService
 * - Dispatch slice actions for state updates
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from '@/features/auth/api/authApi';
import {
  setUser,
  setAuthLoading,
  setAuthError,
  setOperationError,
  clearAuth,
} from '../slices/authSlice';

// ==========================================
// LOGIN
// ==========================================

/**
 * Login user
 * Backend sets httpOnly cookie automatically
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(setAuthError(null));
      
      const response = await authService.login(credentials);
      
      if (response.success) {
        dispatch(setUser(response.data.user));
        return response.data.user;
      } else {
        throw new Error('Login failed');
      }
   } catch (error) {
      // Full error object return করুন
      const errorPayload = {
        status: error.response?.status,
        message: error.response?.data?.message || error.message || 'Login failed',
        data: error.response?.data?.data || null
      };
      
      dispatch(setAuthError(errorPayload.message));
      return rejectWithValue(errorPayload); // ⭐ এটাই main fix
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

// ==========================================
// FETCH CURRENT USER
// ==========================================

/**
 * Fetch current user profile
 * Cookie automatically sent by browser
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true));
      
      const response = await authService.getProfile();
      
      if (response.success) {
        dispatch(setUser(response.data.user));
        return response.data.user;
      }
    } catch (error) {
      const message = 'Session expired';
      dispatch(setAuthError(message));
      dispatch(clearAuth()); // Clear state on session expiry
      return rejectWithValue(message);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

// ==========================================
// LOGOUT
// ==========================================

/**
 * Logout user
 * Backend clears httpOnly cookie
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      dispatch(setAuthLoading(true));
      
      await authService.logout();
      
      dispatch(clearAuth()); // Clear Redux state
      return null;
    } catch (error) {
      // Even on error, clear state
      dispatch(clearAuth());
      return null;
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

// ==========================================
// UPDATE PROFILE
// ==========================================

/**
 * Update user profile
 * Cookie automatically sent by browser
 */
export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(setOperationError(null));
      
      const response = await authService.updateProfile(profileData);
      
      if (response.success) {
        dispatch(setUser(response.data.user));
        return response.data.user;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      dispatch(setOperationError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

// ==========================================
// DELETE ACCOUNT
// ==========================================

/**
 * Delete user account permanently
 * Backend clears httpOnly cookie and deletes user from DB
 */
export const deleteAccountUser = createAsyncThunk(
  'auth/deleteAccount',
  async (passwordData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(setOperationError(null));
      
      const response = await authService.deleteAccount(passwordData.password);
      
      if (response.success) {
        dispatch(clearAuth()); // Clear state after deletion
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete account');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete account';
      dispatch(setOperationError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

// ==========================================
// REGISTER (Optional - commented in your code)
// ==========================================

/**
 * Register user
 * Backend sets httpOnly cookie automatically
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(setAuthError(null));
      
      const response = await authService.register(userData);
      
      if (response.success) {
        dispatch(setUser(response.data.user));
        return response.data.user;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      dispatch(setAuthError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);