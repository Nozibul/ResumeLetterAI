/**
 * @file store/actions/resumeActions.js
 * @description Resume async actions (thunks)
 * @author Nozibul Islam
 * 
 * Architecture:
 * - All async resume operations
 * - API calls via resumeService
 * - Dispatch slice actions for state updates
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import resumeService from '@/features/resume/api/resumeApi';
import {
  setResumes,
  setSelectedResume,
  setDraftResumes,
  setCompletedResumes,
  setResumeLoading,
  setResumeError,
  addResume,
  updateResume,
  removeResume,
  updateResumeTitle,
  toggleResumeVisibility,
  incrementDownloadCount,
} from '../slices/resumeSlice';

// ==========================================
// CREATE RESUME
// ==========================================

/**
 * Create new resume
 */
export const createResumeAction = createAsyncThunk(
  'resume/create',
  async (resumeData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setResumeLoading(true));
      const response = await resumeService.createResume(resumeData);

      if (response.success) {
        dispatch(addResume(response.data.resume));
        return response.data.resume;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create resume';
      dispatch(setResumeError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setResumeLoading(false));
    }
  }
);

// ==========================================
// FETCH ALL RESUMES
// ==========================================

/**
 * Fetch all resumes of logged-in user
 */
export const fetchAllResumes = createAsyncThunk(
  'resume/fetchAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setResumeLoading(true));
      const response = await resumeService.getAllResumes();

      if (response.success) {
        dispatch(setResumes(response.data.resumes));
        return response.data.resumes;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch resumes';
      dispatch(setResumeError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setResumeLoading(false));
    }
  }
);

// ==========================================
// FETCH DRAFT RESUMES
// ==========================================

/**
 * Fetch draft resumes (incomplete)
 */
export const fetchDraftResumes = createAsyncThunk(
  'resume/fetchDrafts',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setResumeLoading(true));
      const response = await resumeService.getDraftResumes();

      if (response.success) {
        dispatch(setDraftResumes(response.data.resumes));
        return response.data.resumes;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch drafts';
      dispatch(setResumeError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setResumeLoading(false));
    }
  }
);

// ==========================================
// FETCH COMPLETED RESUMES
// ==========================================

/**
 * Fetch completed resumes
 */
export const fetchCompletedResumes = createAsyncThunk(
  'resume/fetchCompleted',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setResumeLoading(true));
      const response = await resumeService.getCompletedResumes();

      if (response.success) {
        dispatch(setCompletedResumes(response.data.resumes));
        return response.data.resumes;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch completed resumes';
      dispatch(setResumeError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setResumeLoading(false));
    }
  }
);

// ==========================================
// FETCH RESUME BY ID
// ==========================================

/**
 * Fetch single resume by ID
 */
export const fetchResumeById = createAsyncThunk(
  'resume/fetchById',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setResumeLoading(true));
      const response = await resumeService.getResumeById(id);

      if (response.success) {
        dispatch(setSelectedResume(response.data.resume));
        return response.data.resume;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch resume';
      dispatch(setResumeError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setResumeLoading(false));
    }
  }
);

// ==========================================
// UPDATE RESUME
// ==========================================

/**
 * Update resume content
 */
export const updateResumeAction = createAsyncThunk(
  'resume/update',
  async ({ id, updateData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setResumeLoading(true));
      const response = await resumeService.updateResume(id, updateData);

      if (response.success) {
        dispatch(updateResume(response.data.resume));
        return response.data.resume;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update resume';
      dispatch(setResumeError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setResumeLoading(false));
    }
  }
);

// ==========================================
// UPDATE RESUME TITLE
// ==========================================

/**
 * Update resume title only
 */
export const updateResumeTitleAction = createAsyncThunk(
  'resume/updateTitle',
  async ({ id, resumeTitle }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setResumeLoading(true));
      const response = await resumeService.updateResumeTitle(id, resumeTitle);

      if (response.success) {
        dispatch(updateResumeTitle({ id, resumeTitle }));
        return response.data.resume;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update title';
      dispatch(setResumeError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setResumeLoading(false));
    }
  }
);

// ==========================================
// DELETE RESUME
// ==========================================

/**
 * Delete resume
 */
export const deleteResumeAction = createAsyncThunk(
  'resume/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setResumeLoading(true));
      const response = await resumeService.deleteResume(id);

      if (response.success) {
        dispatch(removeResume(id));
        return id;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete resume';
      dispatch(setResumeError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setResumeLoading(false));
    }
  }
);

// ==========================================
// DUPLICATE RESUME
// ==========================================

/**
 * Duplicate existing resume
 */
export const duplicateResumeAction = createAsyncThunk(
  'resume/duplicate',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setResumeLoading(true));
      const response = await resumeService.duplicateResume(id);

      if (response.success) {
        dispatch(addResume(response.data.resume));
        return response.data.resume;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to duplicate resume';
      dispatch(setResumeError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setResumeLoading(false));
    }
  }
);

// ==========================================
// TOGGLE VISIBILITY
// ==========================================

/**
 * Toggle resume visibility (public/private)
 */
export const toggleVisibilityAction = createAsyncThunk(
  'resume/toggleVisibility',
  async ({ id, isPublic }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setResumeLoading(true));
      const response = await resumeService.toggleVisibility(id, isPublic);

      if (response.success) {
        dispatch(toggleResumeVisibility({ id, isPublic }));
        return response.data.resume;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to toggle visibility';
      dispatch(setResumeError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setResumeLoading(false));
    }
  }
);

// ==========================================
// TRACK DOWNLOAD
// ==========================================

/**
 * Track resume download
 */
export const trackDownloadAction = createAsyncThunk(
  'resume/trackDownload',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await resumeService.trackDownload(id);

      if (response.success) {
        dispatch(incrementDownloadCount(id));
        return id;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to track download';
      return rejectWithValue(message);
    }
  }
);