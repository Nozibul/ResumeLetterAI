/**
 * @file store/hooks/useAuth.js
 * @description Custom Redux hooks for Authentication
 * @author Nozibul Islam
 */

import { useDispatch, useSelector } from 'react-redux';
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectOperationError,
  selectUserId,
  selectUserEmail,
  selectUserName,
  selectUserRole,
  selectIsAdmin,
  selectIsEmailVerified,
} from '../selectors/authSelectors';

// ==========================================
// BASIC HOOKS
// ==========================================

/**
 * Typed dispatch hook
 */
export const useAppDispatch = () => useDispatch();

// ==========================================
// AUTH HOOKS
// ==========================================

/**
 * Get entire auth state
 */
export const useAuth = () => useSelector(selectAuth);

/**
 * Get current user object
 */
export const useAuthUser = () => useSelector(selectUser);

/**
 * Get authentication status
 */
export const useIsAuthenticated = () => useSelector(selectIsAuthenticated);

/**
 * Get auth loading state
 */
export const useAuthLoading = () => useSelector(selectAuthLoading);

/**
 * Get authentication error
 */
export const useAuthError = () => useSelector(selectAuthError);

/**
 * Get operation error
 */
export const useOperationError = () => useSelector(selectOperationError);

// ==========================================
// USER INFO HOOKS
// ==========================================

/**
 * Get user ID
 */
export const useUserId = () => useSelector(selectUserId);

/**
 * Get user email
 */
export const useUserEmail = () => useSelector(selectUserEmail);

/**
 * Get user name
 */
export const useUserName = () => useSelector(selectUserName);

/**
 * Get user role
 */
export const useUserRole = () => useSelector(selectUserRole);

/**
 * Check if user is admin
 */
export const useIsAdmin = () => useSelector(selectIsAdmin);

/**
 * Check if email is verified
 */
export const useIsEmailVerified = () => useSelector(selectIsEmailVerified);
