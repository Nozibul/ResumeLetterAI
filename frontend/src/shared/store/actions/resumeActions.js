/**
 * @file store/actions/resumeActions.js
 * @description Resume async thunks
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * - No manual loading dispatch — handled by extraReducers (pending/fulfilled/rejected)
 * - Each thunk returns exactly what the slice needs
 * - Removed: fetchDraftResumes, fetchCompletedResumes, updateResumeTitleAction,
 *   toggleVisibilityAction, trackDownloadAction (no backend support)
 * - Added: updateSectionOrderAction, updateSectionVisibilityAction, switchTemplateAction
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import resumeService from '@/features/resume-builder/api/resumeApi';
const rejectMsg = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

// ── Fetch all ────────────────────────────────────────────────────────────────

export const fetchAllResumes = createAsyncThunk(
  'resume/fetchAll',
  async (options = {}, { rejectWithValue }) => {
    try {
      const res = await resumeService.getAllResumes(options);
      // { resumes, total, limit }
      return res.data;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, 'Failed to fetch resumes'));
    }
  }
);

// ── Fetch by ID ──────────────────────────────────────────────────────────────

export const fetchResumeById = createAsyncThunk(
  'resume/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await resumeService.getResumeById(id);
      return res.data.resume;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, 'Failed to fetch resume'));
    }
  }
);

// ── Create ───────────────────────────────────────────────────────────────────

export const createResumeAction = createAsyncThunk(
  'resume/create',
  async (resumeData, { rejectWithValue }) => {
    try {
      const res = await resumeService.createResume(resumeData);
      return res.data.resume;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, 'Failed to create resume'));
    }
  }
);

// ── Update ───────────────────────────────────────────────────────────────────

export const updateResumeAction = createAsyncThunk(
  'resume/update',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const res = await resumeService.updateResume(id, updateData);
      return res.data.resume;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, 'Failed to update resume'));
    }
  }
);

// ── Delete ───────────────────────────────────────────────────────────────────

export const deleteResumeAction = createAsyncThunk(
  'resume/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await resumeService.deleteResume(id);
      // backend returns { id }
      return res.data.id;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, 'Failed to delete resume'));
    }
  }
);

// ── Duplicate ────────────────────────────────────────────────────────────────

export const duplicateResumeAction = createAsyncThunk(
  'resume/duplicate',
  async ({ id, title } = {}, { rejectWithValue }) => {
    try {
      const res = await resumeService.duplicateResume(id, title);
      return res.data.resume;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, 'Failed to duplicate resume'));
    }
  }
);

// ── Section order ────────────────────────────────────────────────────────────

export const updateSectionOrderAction = createAsyncThunk(
  'resume/updateSectionOrder',
  async ({ id, sectionOrder }, { rejectWithValue }) => {
    try {
      const res = await resumeService.updateSectionOrder(id, sectionOrder);
      return res.data.resume;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, 'Failed to update section order'));
    }
  }
);

// ── Section visibility ───────────────────────────────────────────────────────

export const updateSectionVisibilityAction = createAsyncThunk(
  'resume/updateSectionVisibility',
  async ({ id, sectionVisibility }, { rejectWithValue }) => {
    try {
      const res = await resumeService.updateSectionVisibility(
        id,
        sectionVisibility
      );
      return res.data.resume;
    } catch (err) {
      return rejectWithValue(
        rejectMsg(err, 'Failed to update section visibility')
      );
    }
  }
);

// ── Switch template ──────────────────────────────────────────────────────────

export const switchTemplateAction = createAsyncThunk(
  'resume/switchTemplate',
  async ({ id, templateId }, { rejectWithValue }) => {
    try {
      const res = await resumeService.switchTemplate(id, templateId);
      return res.data.resume;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, 'Failed to switch template'));
    }
  }
);
