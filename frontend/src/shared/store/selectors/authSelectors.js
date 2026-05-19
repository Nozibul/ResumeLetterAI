/**
 * @file store/selectors/authSelectors.js
 * @description Authentication state selectors
 * @author Nozibul Islam
 * @version 2.0.0
 */

// ── Raw state ─────────────────────────────────────────────────────────────────

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.authError;
export const selectOperationError = (state) => state.auth.operationError;

// ── User fields ───────────────────────────────────────────────────────────────

export const selectUserId = (state) => state.auth.user?._id;
export const selectUserEmail = (state) => state.auth.user?.email;
export const selectUserName = (state) => state.auth.user?.fullName;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectIsEmailVerified = (state) =>
  state.auth.user?.isEmailVerified ?? false;

// ── Derived ───────────────────────────────────────────────────────────────────

export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';

export const selectIsPremium = (state) => state.auth.user?.role === 'premium';

/**
 * Profile is "complete" when the user has a name, verified email, and active account.
 * Extend this as the User model grows.
 */
export const selectHasCompletedProfile = (state) => {
  const user = state.auth.user;
  if (!user) return false;
  return !!(user.fullName && user.email && user.isEmailVerified);
};

/** Any error currently set — useful for generic error display */
export const selectAnyError = (state) =>
  state.auth.authError || state.auth.operationError || null;
