/**
 * @file store/hooks/useResume.js
 * @description Custom Redux hooks for Resume
 * @author Nozibul Islam
 * @version 2.1.0
 *
 * - useAppDispatch removed from here — defined once in useAuth.js.
 *   Import it from useAuth.js everywhere.
 */

import { useSelector } from 'react-redux';
import {
  selectAllResumes,
  selectResumeTotal,
  selectSelectedResume,
  selectCurrentResumeData,
  selectResumeLoading,
  selectResumeError,
  selectIsSaving,
  selectCurrentStep,
  selectSectionOrder,
  selectSectionVisibility,
  selectCompletionPercentage,
  selectHasResumes,
  selectTotalResumes,
  selectIsResumesCached,
  selectCompletedResumes,
  selectIncompleteResumes,
  selectRecentResumes,
  selectResumeStats,
  selectResumeById,
  selectResumesByTemplate,
  selectSortedResumes,
} from '../selectors/resumeSelectors';

// ── List & counts ─────────────────────────────────────────────────────────────

export const useAllResumes = () => useSelector(selectAllResumes);
export const useResumeTotal = () => useSelector(selectResumeTotal);
export const useHasResumes = () => useSelector(selectHasResumes);
export const useTotalResumes = () => useSelector(selectTotalResumes);
export const useCompletedResumes = () => useSelector(selectCompletedResumes);
export const useIncompleteResumes = () => useSelector(selectIncompleteResumes);
export const useRecentResumes = () => useSelector(selectRecentResumes);
export const useResumeStats = () => useSelector(selectResumeStats);
export const useIsResumesCached = () => useSelector(selectIsResumesCached);

/** @param {'newest'|'oldest'|'title'} [sortBy='newest'] */
export const useSortedResumes = (sortBy = 'newest') =>
  useSelector((state) => selectSortedResumes(state, sortBy));

/** @param {string} id */
export const useResumeById = (id) =>
  useSelector((state) => selectResumeById(state, id));

/** @param {string} templateId */
export const useResumesByTemplate = (templateId) =>
  useSelector((state) => selectResumesByTemplate(state, templateId));

// ── Selected resume ───────────────────────────────────────────────────────────

export const useSelectedResume = () => useSelector(selectSelectedResume);

// ── Editor ────────────────────────────────────────────────────────────────────

export const useCurrentResumeData = () => useSelector(selectCurrentResumeData);
export const useIsSaving = () => useSelector(selectIsSaving);
export const useCurrentStep = () => useSelector(selectCurrentStep);
export const useSectionOrder = () => useSelector(selectSectionOrder);
export const useSectionVisibility = () => useSelector(selectSectionVisibility);
export const useCompletionPercentage = () =>
  useSelector(selectCompletionPercentage);

// ── Status ────────────────────────────────────────────────────────────────────

export const useResumeLoading = () => useSelector(selectResumeLoading);
export const useResumeError = () => useSelector(selectResumeError);
