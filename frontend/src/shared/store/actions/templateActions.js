/**
 * @file store/actions/templateActions.js
 * @description Template async actions (thunks)
 * @author Nozibul Islam
 * 
 * Architecture:
 * - All async template operations
 * - API calls via templateService
 * - Dispatch slice actions for state updates
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import templateService from '@/features/templates/api/templateApi';
import {
  setTemplates,
  setSelectedTemplate,
  setCategoryStats,
  setTemplateLoading,
  setTemplateError,
} from '../slices/templateSlice';

// ==========================================
// FETCH ALL TEMPLATES
// ==========================================

/**
 * Fetch all templates (with optional category filter)
 */
export const fetchAllTemplates = createAsyncThunk(
  'template/fetchAll',
  async (category, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setTemplateLoading(true));
      const response = await templateService.getAllTemplates(category);

      if (response.success) {
        dispatch(setTemplates(response.data.templates));
        return response.data.templates;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch templates';
      dispatch(setTemplateError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setTemplateLoading(false));
    }
  }
);

// ==========================================
// FETCH TEMPLATE BY ID
// ==========================================

/**
 * Fetch single template by ID
 */
export const fetchTemplateById = createAsyncThunk(
  'template/fetchById',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setTemplateLoading(true));
      const response = await templateService.getTemplateById(id);

      if (response.success) {
        dispatch(setSelectedTemplate(response.data.template));
        return response.data.template;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch template';
      dispatch(setTemplateError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setTemplateLoading(false));
    }
  }
);

// ==========================================
// FETCH TEMPLATE PREVIEW
// ==========================================

/**
 * Fetch template preview data
 */
export const fetchTemplatePreview = createAsyncThunk(
  'template/fetchPreview',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setTemplateLoading(true));
      const response = await templateService.getTemplatePreview(id);

      if (response.success) {
        return response.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch preview';
      dispatch(setTemplateError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setTemplateLoading(false));
    }
  }
);

// ==========================================
// FETCH CATEGORY STATS
// ==========================================

/**
 * Fetch category statistics
 */
export const fetchCategoryStats = createAsyncThunk(
  'template/fetchCategoryStats',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await templateService.getCategoryStats();

      if (response.success) {
        dispatch(setCategoryStats(response.data));
        return response.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch stats';
      return rejectWithValue(message);
    }
  }
);

// ==========================================
// CREATE TEMPLATE (Admin)
// ==========================================

/**
 * Create new template (Admin only)
 */
export const createTemplateAction = createAsyncThunk(
  'template/create',
  async (templateData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setTemplateLoading(true));
      const response = await templateService.createTemplate(templateData);

      if (response.success) {
        // Refresh templates list
        dispatch(fetchAllTemplates());
        return response.data.template;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create template';
      dispatch(setTemplateError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setTemplateLoading(false));
    }
  }
);

// ==========================================
// UPDATE TEMPLATE (Admin)
// ==========================================

/**
 * Update template (Admin only)
 */
export const updateTemplateAction = createAsyncThunk(
  'template/update',
  async ({ id, updateData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setTemplateLoading(true));
      const response = await templateService.updateTemplate(id, updateData); // api call

      if (response.success) {
        // Refresh templates list
        dispatch(fetchAllTemplates());
        return response.data.template;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update template';
      dispatch(setTemplateError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setTemplateLoading(false));
    }
  }
);

// ==========================================
// DELETE TEMPLATE (Admin)
// ==========================================

/**
 * Delete template (Admin only)
 */
export const deleteTemplateAction = createAsyncThunk(
  'template/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setTemplateLoading(true));
      const response = await templateService.deleteTemplate(id);

      if (response.success) {
        // Refresh templates list
        dispatch(fetchAllTemplates());
        return id;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete template';
      dispatch(setTemplateError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setTemplateLoading(false));
    }
  }
);