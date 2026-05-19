/**
 * @file store/hooks/useAuth.js
 * @description Auth hooks
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * useAppDispatch is defined once here and re-exported.
 * Import it from this file everywhere — do not redefine it in other hook files.
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
  selectIsPremium,
  selectIsEmailVerified,
  selectHasCompletedProfile,
  selectAnyError,
} from '../selectors/authSelectors';

// ── Shared dispatch hook

/** Use this everywhere instead of useDispatch() directly */
export const useAppDispatch = () => useDispatch();

// ── Auth state

export const useAuthUser = () => useSelector(selectUser);
export const useIsAuthenticated = () => useSelector(selectIsAuthenticated);
export const useAuthLoading = () => useSelector(selectAuthLoading);
export const useAuthError = () => useSelector(selectAuthError);
export const useOperationError = () => useSelector(selectOperationError);
export const useAnyError = () => useSelector(selectAnyError);
export const useAuth = () => useSelector(selectAuth);

// ── User fields

export const useUserId = () => useSelector(selectUserId);
export const useUserEmail = () => useSelector(selectUserEmail);
export const useUserName = () => useSelector(selectUserName);
export const useUserRole = () => useSelector(selectUserRole);
export const useIsAdmin = () => useSelector(selectIsAdmin);
export const useIsPremium = () => useSelector(selectIsPremium);
export const useIsEmailVerified = () => useSelector(selectIsEmailVerified);
export const useHasCompletedProfile = () =>
  useSelector(selectHasCompletedProfile);
