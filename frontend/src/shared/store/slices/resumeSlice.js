/**
 * @file store/slices/resumeSlice.js
 * @description Resume state management (Reducer only)
 * @author Nozibul Islam
 * 
 * Architecture:
 * - Pure state management (no async logic)
 * - Selectors moved to selectors/resumeSelectors.js
 * - Async thunks moved to actions/resumeActions.js
 */

import { createSlice } from '@reduxjs/toolkit';

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  resumes: [],              // All user's resumes
  selectedResume: null,     // Currently selected resume (for editing/viewing)
  drafts: [],               // Draft resumes (cached)
  completed: [],            // Completed resumes (cached)
  loading: false,           // Loading state
  error: null,              // Error message
  lastFetched: null,        // Timestamp for cache invalidation
};

// ==========================================
// SLICE
// ==========================================

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    /**
     * Set all resumes
     */
    setResumes: (state, action) => {
      state.resumes = action.payload;
      state.lastFetched = Date.now();
      state.error = null;
    },

    /**
     * Set selected resume
     */
    setSelectedResume: (state, action) => {
      state.selectedResume = action.payload;
      state.error = null;
    },

    /**
     * Set draft resumes
     */
    setDraftResumes: (state, action) => {
      state.drafts = action.payload;
      state.error = null;
    },

    /**
     * Set completed resumes
     */
    setCompletedResumes: (state, action) => {
      state.completed = action.payload;
      state.error = null;
    },

    /**
     * Set loading state
     */
    setResumeLoading: (state, action) => {
      state.loading = action.payload;
    },

    /**
     * Set error
     */
    setResumeError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    /**
     * Clear error
     */
    clearResumeError: (state) => {
      state.error = null;
    },

    /**
     * Clear selected resume
     */
    clearSelectedResume: (state) => {
      state.selectedResume = null;
    },

    /**
     * Clear all resume state
     */
    clearResumeState: (state) => {
      state.resumes = [];
      state.selectedResume = null;
      state.drafts = [];
      state.completed = [];
      state.loading = false;
      state.error = null;
      state.lastFetched = null;
    },

    /**
     * Add new resume
     */
    addResume: (state, action) => {
      state.resumes.unshift(action.payload);
      // Add to drafts if incomplete
      if (!action.payload.isCompleted) {
        state.drafts.unshift(action.payload);
      } else {
        state.completed.unshift(action.payload);
      }
    },

    /**
     * Update resume
     */
    updateResume: (state, action) => {
      const index = state.resumes.findIndex((r) => r._id === action.payload._id);
      if (index !== -1) {
        state.resumes[index] = action.payload;
      }

      // Update in drafts/completed arrays
      const draftIndex = state.drafts.findIndex((r) => r._id === action.payload._id);
      const completedIndex = state.completed.findIndex((r) => r._id === action.payload._id);

      if (action.payload.isCompleted) {
        // Move to completed
        if (draftIndex !== -1) {
          state.drafts.splice(draftIndex, 1);
        }
        if (completedIndex === -1) {
          state.completed.unshift(action.payload);
        } else {
          state.completed[completedIndex] = action.payload;
        }
      } else {
        // Keep in drafts
        if (draftIndex !== -1) {
          state.drafts[draftIndex] = action.payload;
        } else {
          state.drafts.unshift(action.payload);
        }
        if (completedIndex !== -1) {
          state.completed.splice(completedIndex, 1);
        }
      }

      // Update selected resume if it's the same one
      if (state.selectedResume?._id === action.payload._id) {
        state.selectedResume = action.payload;
      }
    },

    /**
     * Remove resume
     */
    removeResume: (state, action) => {
      state.resumes = state.resumes.filter((r) => r._id !== action.payload);
      state.drafts = state.drafts.filter((r) => r._id !== action.payload);
      state.completed = state.completed.filter((r) => r._id !== action.payload);

      // Clear selected resume if it's the deleted one
      if (state.selectedResume?._id === action.payload) {
        state.selectedResume = null;
      }
    },

    /**
     * Update resume title only
     */
    updateResumeTitle: (state, action) => {
      const { id, resumeTitle } = action.payload;

      // Update in resumes array
      const index = state.resumes.findIndex((r) => r._id === id);
      if (index !== -1) {
        state.resumes[index].resumeTitle = resumeTitle;
      }

      // Update in drafts/completed
      const draftIndex = state.drafts.findIndex((r) => r._id === id);
      if (draftIndex !== -1) {
        state.drafts[draftIndex].resumeTitle = resumeTitle;
      }

      const completedIndex = state.completed.findIndex((r) => r._id === id);
      if (completedIndex !== -1) {
        state.completed[completedIndex].resumeTitle = resumeTitle;
      }

      // Update selected resume
      if (state.selectedResume?._id === id) {
        state.selectedResume.resumeTitle = resumeTitle;
      }
    },

    /**
     * Toggle resume visibility
     */
    toggleResumeVisibility: (state, action) => {
      const { id, isPublic } = action.payload;

      // Update in all arrays
      const updateVisibility = (resume) => {
        if (resume._id === id) {
          resume.isPublic = isPublic;
        }
      };

      state.resumes.forEach(updateVisibility);
      state.drafts.forEach(updateVisibility);
      state.completed.forEach(updateVisibility);

      if (state.selectedResume?._id === id) {
        state.selectedResume.isPublic = isPublic;
      }
    },

    /**
     * Increment download count
     */
    incrementDownloadCount: (state, action) => {
      const id = action.payload;

      const incrementCount = (resume) => {
        if (resume._id === id) {
          resume.downloadCount = (resume.downloadCount || 0) + 1;
        }
      };

      state.resumes.forEach(incrementCount);
      state.drafts.forEach(incrementCount);
      state.completed.forEach(incrementCount);

      if (state.selectedResume?._id === id) {
        state.selectedResume.downloadCount = (state.selectedResume.downloadCount || 0) + 1;
      }
    },
  },
});

// ==========================================
// EXPORTS
// ==========================================

export const {
  setResumes,
  setSelectedResume,
  setDraftResumes,
  setCompletedResumes,
  setResumeLoading,
  setResumeError,
  clearResumeError,
  clearSelectedResume,
  clearResumeState,
  addResume,
  updateResume,
  removeResume,
  updateResumeTitle,
  toggleResumeVisibility,
  incrementDownloadCount,
} = resumeSlice.actions;

export default resumeSlice.reducer;