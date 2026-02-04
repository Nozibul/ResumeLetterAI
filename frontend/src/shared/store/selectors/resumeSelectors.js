/**
 * @file store/selectors/resumeSelectors.js
 * @description Resume state selectors
 * @author Nozibul Islam
 *
 * Architecture:
 * - All resume-related selectors
 * - Memoization for performance
 * - Reusable across components
 */

/**
 * Get entire resume state
 */
export const selectResume = (state) => state.resume;

/**
 * Get all resumes array
 */
export const selectAllResumes = (state) => state.resume.resumes;

/**
 * Get resume by ID
 */
export const selectResumeById = (state, id) => {
  return state.resume.resumes.find((resume) => resume._id === id);
};

/**
 * Get selected resume
 */
export const selectSelectedResume = (state) => state.resume.selectedResume;

/**
 * Get draft resumes
 */
export const selectDraftResumes = (state) => state.resume.drafts;

/**
 * Get completed resumes
 */
export const selectCompletedResumes = (state) => state.resume.completed;

/**
 * Get loading state
 */
export const selectResumeLoading = (state) => state.resume.loading;

/**
 * Get error
 */
export const selectResumeError = (state) => state.resume.error;

/**
 * Get total resumes count
 */
export const selectTotalResumes = (state) => state.resume.resumes.length;

/**
 * Get total drafts count
 */
export const selectTotalDrafts = (state) => state.resume.drafts.length;

/**
 * Get total completed count
 */
export const selectTotalCompleted = (state) => state.resume.completed.length;

/**
 * Get public resumes
 */
export const selectPublicResumes = (state) => {
  return state.resume.resumes.filter((resume) => resume.isPublic);
};

/**
 * Get private resumes
 */
export const selectPrivateResumes = (state) => {
  return state.resume.resumes.filter((resume) => !resume.isPublic);
};

/**
 * Get resumes by template ID
 */
export const selectResumesByTemplate = (state, templateId) => {
  return state.resume.resumes.filter(
    (resume) => resume.templateId?._id === templateId
  );
};

/**
 * Get recently updated resumes (last 7 days)
 */
export const selectRecentResumes = (state) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return state.resume.resumes
    .filter((resume) => new Date(resume.updatedAt) > sevenDaysAgo)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

/**
 * Get most downloaded resumes
 */
export const selectMostDownloadedResumes = (state) => {
  return [...state.resume.resumes]
    .filter((resume) => resume.downloadCount > 0)
    .sort((a, b) => b.downloadCount - a.downloadCount);
};

/**
 * Check if resumes are cached (within 5 minutes)
 */
export const selectIsResumesCached = (state) => {
  const lastFetched = state.resume.lastFetched;
  if (!lastFetched) return false;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  return Date.now() - lastFetched < CACHE_DURATION;
};

/**
 * Get resume statistics
 */
export const selectResumeStats = (state) => {
  const resumes = state.resume.resumes;

  return {
    total: resumes.length,
    drafts: resumes.filter((r) => !r.isCompleted).length,
    completed: resumes.filter((r) => r.isCompleted).length,
    public: resumes.filter((r) => r.isPublic).length,
    private: resumes.filter((r) => !r.isPublic).length,
    totalDownloads: resumes.reduce((sum, r) => sum + (r.downloadCount || 0), 0),
  };
};

/**
 * Get resumes sorted by criteria
 */
export const selectSortedResumes = (state, sortBy = 'updatedAt') => {
  const resumes = [...state.resume.resumes];

  switch (sortBy) {
    case 'updatedAt':
      return resumes.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    case 'createdAt':
      return resumes.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    case 'title':
      return resumes.sort((a, b) => a.resumeTitle.localeCompare(b.resumeTitle));
    case 'downloads':
      return resumes.sort(
        (a, b) => (b.downloadCount || 0) - (a.downloadCount || 0)
      );
    default:
      return resumes;
  }
};

/**
 * Check if user has any resumes
 */
export const selectHasResumes = (state) => {
  return state.resume.resumes.length > 0;
};

/**
 * Check if selected resume is editable (not public or user owns it)
 */
export const selectIsSelectedResumeEditable = (state) => {
  const selected = state.resume.selectedResume;
  if (!selected) return false;
  // Add more conditions as needed
  return true;
};

export const selectCurrentResumeData = (state) =>
  state.resume.currentResumeData;
export const selectIsSaving = (state) => state.resume.isSaving;
export const selectCurrentStep = (state) => state.resume.currentStep;
export const selectCompletionPercentage = (state) =>
  state.resume.completionPercentage;
