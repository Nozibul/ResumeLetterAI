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

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// ==========================================
// AUTH HOOKS
// ==========================================

export const useAuth = () => useAppSelector(selectAuth);
export const useAuthUser = () => useAppSelector(selectUser);
export const useIsAuthenticated = () => useAppSelector(selectIsAuthenticated);
export const useAuthLoading = () => useAppSelector(selectAuthLoading);
export const useAuthError = () => useAppSelector(selectAuthError);
export const useOperationError = () => useAppSelector(selectOperationError);

// ==========================================
// ADDITIONAL HOOKS (User Info)
// ==========================================

export const useUserId = () => useAppSelector(selectUserId);
export const useUserEmail = () => useAppSelector(selectUserEmail);
export const useUserName = () => useAppSelector(selectUserName);
export const useUserRole = () => useAppSelector(selectUserRole);
export const useIsAdmin = () => useAppSelector(selectIsAdmin);
export const useIsEmailVerified = () => useAppSelector(selectIsEmailVerified);
