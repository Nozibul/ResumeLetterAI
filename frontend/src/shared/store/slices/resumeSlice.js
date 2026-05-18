/**
 * @file store/slices/resumeSlice.js
 * @description Resume state management
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * Design decisions:
 * - drafts/completed arrays removed — backend has no isCompleted field.
 *   Use selectCompletedResumes / selectIncompleteResumes selectors instead
 *   (derived from completionPercentage which backend calculates).
 * - isPublic/downloadCount removed — not in backend model.
 * - resumeTitle → title (matches backend model field).
 * - loading state managed entirely in extraReducers (pending/fulfilled/rejected).
 *   No manual setResumeLoading dispatch in thunks.
 * - updateResumeAction does NOT set loading=true to support silent auto-save.
 *   Use isSaving for auto-save UI feedback instead.
 * - reorderSections is an optimistic local update; the thunk persists to backend.
 */

import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAllResumes,
  fetchResumeById,
  createResumeAction,
  updateResumeAction,
  deleteResumeAction,
  duplicateResumeAction,
  updateSectionOrderAction,
  updateSectionVisibilityAction,
  switchTemplateAction,
} from '../actions/resumeActions';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sync an updated resume into the resumes array and selectedResume.
 * Extracted so multiple cases can call it without repetition.
 */
const syncUpdatedResume = (state, updated) => {
  const idx = state.resumes.findIndex((r) => r._id === updated._id);
  if (idx !== -1) state.resumes[idx] = updated;
  if (state.selectedResume?._id === updated._id) state.selectedResume = updated;
};

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
  /** All active resumes for the user (from GET /resumes) */
  resumes: [],
  /** Total count as reported by the backend */
  total: 0,
  /** Resume currently open for viewing */
  selectedResume: null,
  /**
   * Resume being actively edited.
   * Kept separate from selectedResume so editor changes don't
   * affect the list view until explicitly saved.
   */
  currentResumeData: null,
  /** Auto-save in-progress indicator for editor UI */
  isSaving: false,
  /** Current step in the multi-step resume form (1–9) */
  currentStep: 1,
  loading: false,
  error: null,
  /** Unix timestamp — used for 5-minute cache check */
  lastFetched: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const resumeSlice = createSlice({
  name: 'resume',
  initialState,

  reducers: {
    // ── Editor ───────────────────────────────────────────────────────────────

    /** Load a resume into the editor */
    setCurrentResumeData: (state, action) => {
      state.currentResumeData = action.payload;
    },

    /** Clear editor state when navigating away */
    clearCurrentResumeData: (state) => {
      state.currentResumeData = null;
      state.currentStep = 1;
    },

    /**
     * Update a single field in the editor (used by auto-save).
     * Only mutates currentResumeData — does not touch resumes array.
     */
    updateCurrentResumeField: (state, action) => {
      const { field, value } = action.payload;
      if (state.currentResumeData) {
        state.currentResumeData[field] = value;
      }
    },

    /** Mark auto-save in progress */
    setIsSaving: (state, action) => {
      state.isSaving = action.payload;
    },

    /** Advance or retreat the multi-step form */
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },

    /**
     * Optimistic drag-and-drop reorder.
     * The caller is responsible for dispatching updateSectionOrderAction
     * immediately after to persist the change.
     */
    reorderSections: (state, action) => {
      if (!state.currentResumeData?.sectionOrder) return;
      const { fromIndex, toIndex } = action.payload;
      const order = [...state.currentResumeData.sectionOrder];
      const [moved] = order.splice(fromIndex, 1);
      order.splice(toIndex, 0, moved);
      state.currentResumeData.sectionOrder = order;
    },

    /** Reset section order to the backend default */
    resetSectionOrder: (state) => {
      if (!state.currentResumeData) return;
      state.currentResumeData.sectionOrder = [
        'personalInfo',
        'summary',
        'workExperience',
        'projects',
        'skills',
        'education',
        'competitiveProgramming',
        'certifications',
      ];
    },

    // ── Selection ─────────────────────────────────────────────────────────────

    setSelectedResume: (state, action) => {
      state.selectedResume = action.payload;
    },

    clearSelectedResume: (state) => {
      state.selectedResume = null;
    },

    // ── Error / Reset ─────────────────────────────────────────────────────────

    clearResumeError: (state) => {
      state.error = null;
    },

    /** Full state reset — call on logout */
    clearResumeState: () => initialState,
  },

  // ── Async (extraReducers) ──────────────────────────────────────────────────

  extraReducers: (builder) => {
    // fetchAllResumes
    builder
      .addCase(fetchAllResumes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllResumes.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.resumes = payload.resumes;
        state.total = payload.total;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAllResumes.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    // fetchResumeById
    builder
      .addCase(fetchResumeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResumeById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedResume = payload;
      })
      .addCase(fetchResumeById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    // createResumeAction
    builder
      .addCase(createResumeAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResumeAction.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.resumes.unshift(payload);
        state.total += 1;
      })
      .addCase(createResumeAction.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    // updateResumeAction — no loading flag (supports silent auto-save)
    builder
      .addCase(updateResumeAction.pending, (state) => {
        state.error = null;
      })
      .addCase(updateResumeAction.fulfilled, (state, { payload }) => {
        syncUpdatedResume(state, payload);
      })
      .addCase(updateResumeAction.rejected, (state, { payload }) => {
        state.error = payload;
      });

    // deleteResumeAction
    builder
      .addCase(deleteResumeAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResumeAction.fulfilled, (state, { payload: id }) => {
        state.loading = false;
        state.resumes = state.resumes.filter((r) => r._id !== id);
        state.total = Math.max(0, state.total - 1);
        if (state.selectedResume?._id === id) state.selectedResume = null;
      })
      .addCase(deleteResumeAction.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    // duplicateResumeAction
    builder
      .addCase(duplicateResumeAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(duplicateResumeAction.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.resumes.unshift(payload);
        state.total += 1;
      })
      .addCase(duplicateResumeAction.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    // updateSectionOrderAction
    builder
      .addCase(updateSectionOrderAction.fulfilled, (state, { payload }) => {
        syncUpdatedResume(state, payload);
        // Also keep currentResumeData in sync if it's the same resume
        if (state.currentResumeData?._id === payload._id) {
          state.currentResumeData.sectionOrder = payload.sectionOrder;
        }
      })
      .addCase(updateSectionOrderAction.rejected, (state, { payload }) => {
        state.error = payload;
      });

    // updateSectionVisibilityAction
    builder
      .addCase(
        updateSectionVisibilityAction.fulfilled,
        (state, { payload }) => {
          syncUpdatedResume(state, payload);
          if (state.currentResumeData?._id === payload._id) {
            state.currentResumeData.sectionVisibility =
              payload.sectionVisibility;
          }
        }
      )
      .addCase(updateSectionVisibilityAction.rejected, (state, { payload }) => {
        state.error = payload;
      });

    // switchTemplateAction
    builder
      .addCase(switchTemplateAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(switchTemplateAction.fulfilled, (state, { payload }) => {
        state.loading = false;
        syncUpdatedResume(state, payload);
      })
      .addCase(switchTemplateAction.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

// ── Exports ───────────────────────────────────────────────────────────────────

export const {
  setCurrentResumeData,
  clearCurrentResumeData,
  updateCurrentResumeField,
  setIsSaving,
  setCurrentStep,
  reorderSections,
  resetSectionOrder,
  setSelectedResume,
  clearSelectedResume,
  clearResumeError,
  clearResumeState,
} = resumeSlice.actions;

export default resumeSlice.reducer;
