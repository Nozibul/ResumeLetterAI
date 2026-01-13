/**
 * @file store/rootReducer.js
 * @description Combine all slice reducers for ResumeLetterAI
 * @author Nozibul Islam
 */

import { combineReducers } from '@reduxjs/toolkit';

// Import all slice reducers
import authReducer from './slices/authSlice';
import templateReducer from './slices/templateSlice';
import resumeReducer from './slices/resumeSlice';
// import coverLetterReducer from './slices/coverLetterSlice';
// import uiReducer from './slices/uiSlice';

/**
 * Combine all reducers into one root reducer
 * The keys here become the state shape in your Redux store
 */
const appReducer = combineReducers({
  // These will be persisted (as per persistConfig whitelist)
  auth: authReducer,                        // Authentication state
  resume: resumeReducer,                    // User's resume data
  // coverLetter: coverLetterReducer,          // Cover letter data
  
  // These will NOT be persisted (as per persistConfig blacklist)
  template: templateReducer,                // Templates & preferences
  // ui: uiReducer,                            // UI state (modals, loading)
});

/**
 * Root reducer with reset capability
 * This allows clearing state on specific actions (e.g., logout)
 */
const rootReducer = (state, action) => {
  // Example: Reset state on logout
  // if (action.type === 'auth/logout') {
  //   // Keep only user preferences
  //   const { userPreferences } = state;
  //   state = { userPreferences };
  // }
  
  return appReducer(state, action);
};

export default rootReducer;