/**
 * @file store/selectors/resumeSelectors.js
 * @description Resume state selectors
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * Design decisions:
 * - No memoization library needed at this scale — selectors are simple
 *   property access or lightweight array operations. Add reselect only
 *   if profiling shows re-render issues.
 * - isCompleted/isPublic/downloadCount selectors removed (not in backend model).
 * - "completed" derived from completionPercentage === 100 (backend calculates this).
 * - sort keys match backend query param values: 'newest' | 'oldest' | 'title'.
 * - title field matches backend model ('title', not 'resumeTitle').
 */

// ── Raw state ─────────────────────────────────────────────────────────────────

export const selectAllResumes = (state) => state.resume.resumes;
export const selectResumeTotal = (state) => state.resume.total;
export const selectSelectedResume = (state) => state.resume.selectedResume;
export const selectResumeLoading = (state) => state.resume.loading;
export const selectResumeError = (state) => state.resume.error;
export const selectLastFetched = (state) => state.resume.lastFetched;

// ── Editor ────────────────────────────────────────────────────────────────────

export const selectCurrentResumeData = (state) =>
  state.resume.currentResumeData;
export const selectIsSaving = (state) => state.resume.isSaving;
export const selectCurrentStep = (state) => state.resume.currentStep;
export const selectSectionOrder = (state) =>
  state.resume.currentResumeData?.sectionOrder ?? [];
export const selectSectionVisibility = (state) =>
  state.resume.currentResumeData?.sectionVisibility ?? {};
export const selectCompletionPercentage = (state) =>
  state.resume.currentResumeData?.completionPercentage ?? 0;

// ── Derived ───────────────────────────────────────────────────────────────────

export const selectHasResumes = (state) => state.resume.resumes.length > 0;

export const selectTotalResumes = (state) => state.resume.resumes.length;

/** Resume whose completionPercentage is exactly 100 */
export const selectCompletedResumes = (state) =>
  state.resume.resumes.filter((r) => r.completionPercentage === 100);

/** Resume with any work still remaining */
export const selectIncompleteResumes = (state) =>
  state.resume.resumes.filter((r) => r.completionPercentage < 100);

/** Find a single resume from the cached list */
export const selectResumeById = (state, id) =>
  state.resume.resumes.find((r) => r._id === id) ?? null;

/** Filter by template (useful for template-usage stats) */
export const selectResumesByTemplate = (state, templateId) =>
  state.resume.resumes.filter((r) => r.templateId?._id === templateId);

/**
 * Sort keys intentionally match backend query param values
 * so the same value can be passed to both the API and this selector.
 * 'newest' | 'oldest' | 'title'
 */
export const selectSortedResumes = (state, sortBy = 'newest') => {
  const resumes = [...state.resume.resumes];
  switch (sortBy) {
    case 'newest':
      return resumes.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    case 'oldest':
      return resumes.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    case 'title':
      return resumes.sort((a, b) =>
        (a.title ?? '').localeCompare(b.title ?? '')
      );
    default:
      return resumes;
  }
};

/** Resumes updated within the last 7 days, newest first */
export const selectRecentResumes = (state) => {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return [...state.resume.resumes]
    .filter((r) => new Date(r.updatedAt).getTime() > cutoff)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

/**
 * Returns true if resumes were fetched within the last 5 minutes.
 * Use this to skip redundant API calls on component mount.
 */
export const selectIsResumesCached = (state) => {
  const { lastFetched } = state.resume;
  return lastFetched !== null && Date.now() - lastFetched < 5 * 60 * 1000;
};

/**
 * Client-side stats derived from the cached resumes array.
 * No separate API call needed for dashboard display.
 */
export const selectResumeStats = (state) => {
  const { resumes } = state.resume;
  if (!resumes.length)
    return { total: 0, completed: 0, incomplete: 0, avgCompletion: 0 };

  const completed = resumes.filter(
    (r) => r.completionPercentage === 100
  ).length;
  const avgCompletion = Math.round(
    resumes.reduce((sum, r) => sum + (r.completionPercentage ?? 0), 0) /
      resumes.length
  );

  return {
    total: resumes.length,
    completed,
    incomplete: resumes.length - completed,
    avgCompletion,
  };
};
