/**
 * @file store/index.js
 * @description Main Redux store configuration for ResumeLetterAI
 * @author Nozibul Islam
 * 
 * Architecture:
 * - Redux Toolkit for state management
 * - Redux Persist for data persistence (user data, NOT token)
 * - Token handled via httpOnly cookie (backend managed)
 * - Optimized for production with proper middleware
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

// Apply persist configuration to root reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configure Redux Store
 */
export const store = configureStore({
  reducer: persistedReducer,
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions (required)
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        
        // Ignore specific paths if you store non-serializable data
        // Example: File objects in resume/coverLetter upload
        ignoredPaths: ['resume.uploadFile', 'coverLetter.uploadFile'],
      },
      
      // Disable immutable check in production for better performance
      immutableCheck: process.env.NODE_ENV !== 'production',
    }),
  
  // Enable Redux DevTools in development only
  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'ResumeLetterAI Store',
    maxAge: 50, // Keep last 50 actions in history
    trace: true, // Enable stack trace for actions
  },
});

/**
 * Create persistor for redux-persist
 * This handles the rehydration of state from localStorage
 */
export const persistor = persistStore(store, null, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Redux store rehydrated successfully');
    checkStorageSize();
  }
}, (error) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Redux persist error:', error);
  }
});

/**
 * Helper: Check localStorage size (Development only)
 * Warns if approaching browser storage limits
 */
function checkStorageSize() {
  // ✅ Check if running in browser (not SSR)
  if (typeof window === 'undefined') return;

  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  
  const sizeInMB = (total / 1024 / 1024).toFixed(2);
  console.log(`📦 localStorage size: ${sizeInMB}MB`);
  
  // Warn if approaching 5MB limit (most browsers)
  if (parseFloat(sizeInMB) > 4) {
    console.warn('⚠️ localStorage approaching 5MB limit!');
    console.warn('💡 Consider cleaning up old data:');
    console.warn('   - Delete old resumes/cover letters');
    console.warn('   - Clear browser cache');
    console.warn('   - Or migrate to IndexedDB for large files');
  }
}
