/**
 * @file store/utils/persistConfig.js
 * @description Redux Persist configuration
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * Design decisions:
 * - Only 'auth' is persisted at root level.
 *   Resume, template, and all other slices fetch fresh from server on mount —
 *   persisting server data causes stale state bugs.
 *
 * - Auth slice uses a nested persistConfig (authPersistConfig) so that only
 *   'user' and 'isAuthenticated' survive a reload. Transient fields like
 *   'loading', 'authError', and 'operationError' are excluded because they
 *   describe a momentary UI state that has no meaning after a page refresh.
 *
 * - Token is NOT stored here. The backend manages it via httpOnly cookie.
 */

import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import authReducer from '../slices/authSlice';

// Root config

const persistConfig = {
  key: 'resumeLetterAI',
  version: 1,
  storage,

  /**
   * Only auth is persisted at the root level.
   * auth itself uses a nested config (authPersistConfig) below,
   * which further restricts what gets written to storage.
   */
  whitelist: ['auth'],

  throttle: 1000,

  debug: process.env.NODE_ENV === 'development',

  writeFailHandler: (err) => {
    if (err.name === 'QuotaExceededError' || err.message?.includes('quota')) {
      console.error(
        '[Persist] localStorage quota exceeded. ' +
          'Consider purging stale keys or switching to IndexedDB.'
      );
    } else {
      console.error('[Persist] Storage write failed:', err);
    }
  },
};

export default persistConfig;

// Nested auth config

/**
 * Auth-specific persist config.
 *
 * Whitelist: only 'user' and 'isAuthenticated'.
 * Excluded (blacklist by omission):
 *   - loading        → always false on fresh load; no action is in-flight
 *   - authError      → stale error messages should never reappear after reload
 *   - operationError → same reason as authError
 */
const authPersistConfig = {
  key: 'auth',
  version: 1,
  storage,
  whitelist: ['user', 'isAuthenticated'],
};

/**
 * Pre-wrapped auth reducer with its own persist config.
 * Import this in rootReducer instead of the raw authReducer.
 */
export const persistedAuthReducer = persistReducer(
  authPersistConfig,
  authReducer
);
