/**
 * @file store/hooks.js
 * @description Custom Redux hooks for ResumeLetterAI
 * @author Nozibul Islam
 * 
 * Architecture:
 * - Wraps authSlice selectors in hooks for convenience
 * - Provides both hook-based and selector-based approaches
 * - Separates authError and operationError
 * - Reduces boilerplate in components
 */

import { useDispatch, useSelector } from 'react-redux';
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectOperationError,
} from './slices/authSlice';

// ==========================================
// BASIC HOOKS
// ==========================================

/**
 * Typed dispatch hook
 */
export const useAppDispatch = () => useDispatch();

/**
 * Typed selector hook
 */
export const useAppSelector = useSelector;

// ==========================================
// AUTH HOOKS (wraps authSlice selectors)
// ==========================================

/**
 * Get entire auth state
 * @returns {Object} { user, isAuthenticated, loading, authError, operationError }
 */
export const useAuth = () => {
  return useAppSelector(selectAuth);
};

/**
 * Get current user
 * @returns {Object|null} User object or null
 */
export const useAuthUser = () => {
  return useAppSelector(selectUser);
};

/**
 * Get authentication status
 * @returns {boolean} true if logged in AND email verified
 */
export const useIsAuthenticated = () => {
  return useAppSelector(selectIsAuthenticated);
};

/**
 * Get auth loading state
 * @returns {boolean} true if API call in progress
 */
export const useAuthLoading = () => {
  return useAppSelector(selectAuthLoading);
};

/**
 * Get authentication error (login, session, fetch user failures)
 * @returns {string|null} Error message or null
 */
export const useAuthError = () => {
  return useAppSelector(selectAuthError);
};

/**
 * Get operation error (update profile, delete account failures)
 * @returns {string|null} Error message or null
 */
export const useOperationError = () => {
  return useAppSelector(selectOperationError);
};