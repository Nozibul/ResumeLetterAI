/**
 * @file store/utils/persistConfig.js
 * @description Redux Persist configuration for ResumeLetterAI
 * @author ResumeLetterAI Team
 */

import storage from 'redux-persist/lib/storage'; 
import { createTransform } from 'redux-persist';

/**
 * Transform to exclude sensitive fields from persistence
 * This prevents storing unnecessary or sensitive data
 */
const excludeSensitiveDataTransform = createTransform(
  // Transform state on its way to being serialized and persisted
  (inboundState, key) => {
    if (key === 'resume') {
      // Don't persist temporary/draft states
      const { tempData, uploadProgress, ...rest } = inboundState;
      return rest;
    }
    return inboundState;
  },
  // Transform state being rehydrated
  (outboundState, key) => {
    return outboundState;
  },
  // Define which reducers this transform applies to
  { whitelist: ['resume', 'coverLetter'] }
);

/**
 * Main Persist Configuration
 * Optimized for ResumeLetterAI app
 */
const persistConfig = {
  key: 'resumeLetterAI',
  version: 1,
  // Storage engine (localStorage)
  storage,
  whitelist: [
    'resume',           // User's resume data (CRITICAL)
    'coverLetter',      // Cover letter data (CRITICAL)
    'template',         // Selected templates & preferences
    'userPreferences',  // Theme, language, settings
  ],

  // Transforms - Modify data before/after persistence
  transforms: [excludeSensitiveDataTransform],

  // Timeout - Max time to wait for rehydration (10 seconds) Prevents app from hanging if storage is slow
  timeout: 10000,
  
  /**
   * Throttle - Minimum time between writes (1 second)
   * Improves performance by batching rapid state changes
   */
  throttle: 1000,

  // Debug mode - Enable logging in development
  debug: process.env.NODE_ENV === 'development',
  
  /**
   * Serialize/Deserialize - Custom JSON handling
   * Add here if you need special data transformation
   */
  serialize: (data) => JSON.stringify(data),
  deserialize: (data) => JSON.parse(data),
  
  /**
   * Migration - Handle version upgrades
   * This runs when version changes
   */
  migrate: (state) => {
    if (state && state._persist && state._persist.version === 1) {
      console.log('📦 Migrating state from v1 to v2');
    }
    return Promise.resolve(state);
  },
  
  /**
   * WriteFailHandler - Handle storage errors
   */
  writeFailHandler: (err) => {
    console.error('❌ Redux Persist Write Error:', err);
    // Optional: Send to error tracking service
    // logErrorToService(err);
  },
};

/**
 * Nested Persist Config - For specific slices with different settings
 * Use this if you need different persist behavior for different slices
 */

// Resume-specific persist config
export const resumePersistConfig = {
  key: 'resume',
  storage,
  // Only persist specific fields in resume slice
  whitelist: ['resumes', 'currentResume', 'settings'],
  // Don't persist temporary states
  blacklist: ['loading', 'error', 'uploadProgress', 'tempData'],
};

// Cover Letter-specific persist config
export const coverLetterPersistConfig = {
  key: 'coverLetter',
  storage,
  whitelist: ['coverLetters', 'currentCoverLetter'],
  blacklist: ['loading', 'error', 'tempData'],
};

// Template-specific persist config
export const templatePersistConfig = {
  key: 'template',
  storage,
  whitelist: ['selectedTemplate', 'favorites', 'recentlyUsed'],
  blacklist: ['loading', 'allTemplates'], // Don't persist all templates (fetch fresh)
};

// User Preferences config
export const userPreferencesPersistConfig = {
  key: 'userPreferences',
  storage,
  // Persist everything in this slice
  whitelist: ['theme', 'language', 'fontSize', 'autoSave'],
};

/**
 * Export default config
 */
export default persistConfig;


/**
 * ============================================
 * USAGE IN store/index.js
 * ============================================
 */

/*
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import persistConfig from './utils/persistConfig';
import rootReducer from './rootReducer';

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
*/


/**
 * ============================================
 * USAGE WITH NESTED CONFIG (Alternative)
 * ============================================
 */

/*
import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import {
  resumePersistConfig,
  coverLetterPersistConfig,
  templatePersistConfig,
} from './utils/persistConfig';

import resumeReducer from './slices/resumeSlice';
import coverLetterReducer from './slices/coverLetterSlice';
import templateReducer from './slices/templateSlice';
import uiReducer from './slices/uiSlice';

const rootReducer = combineReducers({
  resume: persistReducer(resumePersistConfig, resumeReducer),
  coverLetter: persistReducer(coverLetterPersistConfig, coverLetterReducer),
  template: persistReducer(templatePersistConfig, templateReducer),
  ui: uiReducer, // No persistence for UI
});
*/