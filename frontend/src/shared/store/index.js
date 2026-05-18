/**
 * @file store/index.js
 * @description Redux store
 * @author Nozibul Islam
 * @version 3.0.0
 *
 * - persistReducer wraps rootReducer at the root level (whitelist: ['auth']).
 * - auth itself is already wrapped with its own nested persistConfig inside
 *   persistConfig.js — so the final storage shape is:
 *     localStorage key "resumeLetterAI" → { auth: { user, isAuthenticated } }
 * - persistStore takes exactly one callback (onComplete). Errors go to
 *   writeFailHandler in persistConfig.
 */

import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import persistConfig from './utils/persistConfig';
import rootReducer from './rootReducer';

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Required: suppress warnings for redux-persist internal actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      // Immer's immutability check is expensive — skip in production
      immutableCheck: process.env.NODE_ENV !== 'production',
    }),

  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'ResumeLetterAI',
    maxAge: 50,
    trace: true,
  },
});

/**
 * persistStore(store, config, onComplete)
 * onComplete fires once after rehydration — safe to check storage size here.
 */
export const persistor = persistStore(store, null, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Store rehydrated');
    checkStorageSize();
  }
});

/**
 * Warn if localStorage is approaching the 5 MB browser limit.
 * Development only.
 */
function checkStorageSize() {
  if (typeof window === 'undefined') return;

  const total = Object.keys(localStorage).reduce(
    (sum, key) => sum + localStorage[key].length + key.length,
    0
  );

  const sizeMB = (total / 1024 / 1024).toFixed(2);
  console.log(`📦 localStorage: ${sizeMB} MB`);

  if (parseFloat(sizeMB) > 4) {
    console.warn('⚠️ localStorage approaching 5 MB limit');
  }
}
