/**
 * @file store/hooks/useResume.js
 * @description Custom Redux hooks for Resume management
 * @author Nozibul Islam
 * 
 * Architecture:
 * - Wraps resumeSlice selectors in hooks for convenience
 * - Provides hook-based approach for resume operations
 * - Reduces boilerplate in components
 */

import { useDispatch, useSelector } from 'react-redux';
import {
  selectResume,
  selectAllResumes,
  selectResumeById,
  selectSelectedResume,
  selectDraftResumes,
  selectCompletedResumes,
  selectResumeLoading,
  selectResumeError,
  selectTotalResumes,
  selectTotalDrafts,
  selectTotalCompleted,
  selectPublicResumes,
  selectPrivateResumes,
  selectResumesByTemplate,
  selectRecentResumes,
  selectMostDownloadedResumes,
  selectIsResumesCached,
  selectResumeStats,
  selectSortedResumes,
  selectHasResumes,
  selectIsSelectedResumeEditable,
} from '../selectors/resumeSelectors';

// ==========================================
// BASIC HOOKS
// ==========================================

/**
 * Typed dispatch hook
 */
export const useAppDispatch = () => useDispatch();

/**
 * Typed selector hook
 */
export const useAppSelector = useSelector;

// ==========================================
// RESUME HOOKS (wraps resumeSlice selectors)
// ==========================================

/**
 * Get entire resume state
 * @returns {Object} { resumes, selectedResume, drafts, completed, loading, error }
 */
export const useResume = () => {
  return useAppSelector(selectResume);
};

/**
 * Get all resumes array
 * @returns {Array} Array of resumes
 */
export const useAllResumes = () => {
  return useAppSelector(selectAllResumes);
};

/**
 * Get resume by ID
 * @param {string} id - Resume ID
 * @returns {Object|null} Resume object or null
 */
export const useResumeById = (id) => {
  return useAppSelector((state) => selectResumeById(state, id));
};

/**
 * Get selected resume
 * @returns {Object|null} Selected resume or null
 */
export const useSelectedResume = () => {
  return useAppSelector(selectSelectedResume);
};

/**
 * Get draft resumes
 * @returns {Array} Array of draft resumes
 */
export const useDraftResumes = () => {
  return useAppSelector(selectDraftResumes);
};

/**
 * Get completed resumes
 * @returns {Array} Array of completed resumes
 */
export const useCompletedResumes = () => {
  return useAppSelector(selectCompletedResumes);
};

/**
 * Get resume loading state
 * @returns {boolean} true if fetching resumes
 */
export const useResumeLoading = () => {
  return useAppSelector(selectResumeLoading);
};

/**
 * Get resume error
 * @returns {string|null} Error message or null
 */
export const useResumeError = () => {
  return useAppSelector(selectResumeError);
};

/**
 * Get total resumes count
 * @returns {number} Total number of resumes
 */
export const useTotalResumes = () => {
  return useAppSelector(selectTotalResumes);
};

/**
 * Get total drafts count
 * @returns {number} Total number of drafts
 */
export const useTotalDrafts = () => {
  return useAppSelector(selectTotalDrafts);
};

/**
 * Get total completed count
 * @returns {number} Total number of completed resumes
 */
export const useTotalCompleted = () => {
  return useAppSelector(selectTotalCompleted);
};

/**
 * Get public resumes
 * @returns {Array} Array of public resumes
 */
export const usePublicResumes = () => {
  return useAppSelector(selectPublicResumes);
};

/**
 * Get private resumes
 * @returns {Array} Array of private resumes
 */
export const usePrivateResumes = () => {
  return useAppSelector(selectPrivateResumes);
};

/**
 * Get resumes by template ID
 * @param {string} templateId - Template ID
 * @returns {Array} Filtered resumes
 */
export const useResumesByTemplate = (templateId) => {
  return useAppSelector((state) => selectResumesByTemplate(state, templateId));
};

/**
 * Get recently updated resumes (last 7 days)
 * @returns {Array} Recent resumes
 */
export const useRecentResumes = () => {
  return useAppSelector(selectRecentResumes);
};

/**
 * Get most downloaded resumes
 * @returns {Array} Sorted by download count
 */
export const useMostDownloadedResumes = () => {
  return useAppSelector(selectMostDownloadedResumes);
};

/**
 * Check if resumes are cached
 * @returns {boolean} true if cached
 */
export const useIsResumesCached = () => {
  return useAppSelector(selectIsResumesCached);
};

/**
 * Get resume statistics
 * @returns {Object} { total, drafts, completed, public, private, totalDownloads }
 */
export const useResumeStats = () => {
  return useAppSelector(selectResumeStats);
};

/**
 * Get resumes sorted by criteria
 * @param {string} sortBy - Sort criteria (updatedAt, createdAt, title, downloads)
 * @returns {Array} Sorted resumes
 */
export const useSortedResumes = (sortBy = 'updatedAt') => {
  return useAppSelector((state) => selectSortedResumes(state, sortBy));
};

/**
 * Check if user has any resumes
 * @returns {boolean} true if user has resumes
 */
export const useHasResumes = () => {
  return useAppSelector(selectHasResumes);
};

/**
 * Check if selected resume is editable
 * @returns {boolean} true if editable
 */
export const useIsSelectedResumeEditable = () => {
  return useAppSelector(selectIsSelectedResumeEditable);
};