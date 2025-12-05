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
    if (key === 'resume' || key === 'coverLetter') {
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
    'auth',             // Authentication state (user, token)
    'resume',           // User's resume data (CRITICAL)
    'coverLetter',      // Cover letter data (CRITICAL)
    'template',         // Selected templates & preferences
    'userPreferences',  // Theme, language, settings
  ],

  blacklist: ['ui', 'export', 'notifications', 'api', 'cache'],

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
   * WriteFailHandler - Handle storage errors
   */
  writeFailHandler: (err) => {
    console.error('❌ Redux Persist Write Error:', err);
    // Check if storage is full
    if (err.name === 'QuotaExceededError' || 
        err.message?.includes('quota') ||
        err.message?.includes('QuotaExceededError')) {
      console.error('💾 localStorage is full! Consider clearing old data.');
      console.warn('💡 Tip: Clear browser cache or old resumes');
    }
    // Optional: Send to error tracking service
    // logErrorToService(err);
  },
};

export default persistConfig;

/**
 * Nested Persist Config - For specific slices with different settings
 * Use this if you need different persist behavior for different slices
 */

// Resume-specific persist config
// export const resumePersistConfig = {
//   key: 'resume',
//   storage,
//   // Only persist specific fields in resume slice
//   whitelist: ['resumes', 'currentResume', 'settings'],
//   // Don't persist temporary states
//   blacklist: ['loading', 'error', 'uploadProgress', 'tempData'],
// };
