/**
 * @file store/slices/templateSlice.js
 * @description Template state management (Reducer only)
 * @author Nozibul Islam
 * 
 * Architecture:
 * - Pure state management (no async logic)
 * - Selectors moved to selectors/templateSelectors.js
 * - Async thunks moved to actions/templateActions.js
 */

import { createSlice } from '@reduxjs/toolkit';

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  templates: [],           // All templates
  selectedTemplate: null,  // Currently selected template (for preview/details)
  categoryStats: {},       // { corporate: 5, creative: 3, ... }
  loading: false,          // Loading state
  error: null,             // Error message
  lastFetched: null,       // Timestamp for cache invalidation
};

// ==========================================
// SLICE
// ==========================================

const templateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {
    
    /**
     * Set templates data
     */
    setTemplates: (state, action) => {
      state.templates = action.payload;
      state.lastFetched = Date.now();
      state.error = null;
    },

    /**
     * Set selected template (for details/preview)
     */
    setSelectedTemplate: (state, action) => {
      state.selectedTemplate = action.payload;
      state.error = null;
    },

    /**
     * Set category stats
     */
    setCategoryStats: (state, action) => {
      state.categoryStats = action.payload;
      state.error = null;
    },

    /**
     * Set loading state
     */
    setTemplateLoading: (state, action) => {
      state.loading = action.payload;
    },

    /**
     * Set error
     */
    setTemplateError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    /**
     * Clear error
     */
    clearTemplateError: (state) => {
      state.error = null;
    },

    /**
     * Clear selected template
     */
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
    },

    /**
     * Clear all template state
     */
    clearTemplateState: (state) => {
      state.templates = [];
      state.selectedTemplate = null;
      state.categoryStats = {};
      state.loading = false;
      state.error = null;
      state.lastFetched = null;
    },

    /**
     * Add new template (for admin)
     */
    addTemplate: (state, action) => {
      state.templates.unshift(action.payload);
    },

    /**
     * Update template (for admin)
     */
    updateTemplate: (state, action) => {
      const index = state.templates.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
      // Update selected template if it's the same one
      if (state.selectedTemplate?._id === action.payload._id) {
        state.selectedTemplate = action.payload;
      }
    },

    /**
     * Remove template (for admin)
     */
    removeTemplate: (state, action) => {
      state.templates = state.templates.filter((t) => t._id !== action.payload);
      // Clear selected template if it's the deleted one
      if (state.selectedTemplate?._id === action.payload) {
        state.selectedTemplate = null;
      }
    },
  },
});

// ==========================================
// EXPORTS
// ==========================================

export const {
  setTemplates,
  setSelectedTemplate,
  setCategoryStats,
  setTemplateLoading,
  setTemplateError,
  clearTemplateError,
  clearSelectedTemplate,
  clearTemplateState,
  addTemplate,
  updateTemplate,
  removeTemplate,
} = templateSlice.actions;

export default templateSlice.reducer;