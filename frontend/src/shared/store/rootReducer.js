/**
 * @file store/rootReducer.js
 * @description Root reducer
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * Design decisions:
 * - auth uses persistedAuthReducer (nested persist config) so only
 *   'user' and 'isAuthenticated' are written to localStorage.
 * - On 'auth/logout/fulfilled', state is reset to undefined so every
 *   slice returns its own initialState — no data leaks between sessions.
 * - persistor.purge() must be called from the logout thunk alongside
 *   this reset to also clear what is already written in localStorage.
 */

import { combineReducers } from '@reduxjs/toolkit';
import { persistedAuthReducer } from './utils/persistConfig';
import templateReducer from './slices/templateSlice';
import resumeReducer from './slices/resumeSlice';
// import coverLetterReducer from './slices/coverLetterSlice';

const appReducer = combineReducers({
  auth: persistedAuthReducer,
  resume: resumeReducer,
  template: templateReducer,
  // coverLetter: coverLetterReducer,
});

/**
 * Wraps appReducer to wipe ALL state on logout.
 * Passing undefined causes every slice to fall back to its initialState.
 *
 * NOTE: This handles in-memory state only.
 * Call persistor.purge() in the logout thunk to also clear localStorage.
 */
const rootReducer = (state, action) => {
  if (action.type === 'auth/logout/fulfilled') {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export default rootReducer;
