/**
 * @file store/selectors/authSelectors.js
 * @description Authentication state selectors
 * @author Nozibul Islam
 * 
 * Architecture:
 * - All auth-related selectors
 * - Memoization for performance (if needed)
 * - Reusable across components
 */

/**
 * Get entire auth state
 */
export const selectAuth = (state) => state.auth;

/**
 * Get current user
 */
export const selectUser = (state) => state.auth.user;

/**
 * Get authentication status
 */
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

/**
 * Get auth loading state
 */
export const selectAuthLoading = (state) => state.auth.loading;

/**
 * Get authentication error
 */
export const selectAuthError = (state) => state.auth.authError;

/**
 * Get operation error
 */
export const selectOperationError = (state) => state.auth.operationError;

/**
 * Get user ID
 */
export const selectUserId = (state) => state.auth.user?._id;

/**
 * Get user email
 */
export const selectUserEmail = (state) => state.auth.user?.email;

/**
 * Get user name
 */
export const selectUserName = (state) => state.auth.user?.name;

/**
 * Get user role
 */
export const selectUserRole = (state) => state.auth.user?.role;

/**
 * Check if user is admin
 */
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';

/**
 * Check if email is verified
 */
export const selectIsEmailVerified = (state) => state.auth.user?.isEmailVerified || false;

/**
 * Check if user has completed profile
 */
export const selectHasCompletedProfile = (state) => {
  const user = state.auth.user;
  if (!user) return false;
  return !!(user.name && user.email && user.isEmailVerified);
};

/**
 * Get any error (authError or operationError)
 */
export const selectAnyError = (state) => {
  return state.auth.authError || state.auth.operationError;
};

/**
 * Check if any operation is in progress
 */
export const selectIsLoading = (state) => state.auth.loading;