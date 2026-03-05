/**
 * @file features/resume-builder/work-experience/ui/WorkExperienceForm.jsx
 * @description Work Experience form - Step 3
 * @author Nozibul Islam
 *
 * Refactored to use shared useResumeListForm hook.
 * All init, save, add/remove/update/reorder logic lives in the hook.
 * Component is responsible for UI only.
 */

'use client';

import { memo } from 'react';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import { useResumeListForm } from '@/shared/hooks/useResumeListForm';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import ExperienceItem from './ExperienceItem';
import AddExperienceButton from './AddExperienceButton';
import {
  validateWorkExperienceForm,
  getExperienceQualityScore,
} from '../model/validation';
import { LIMITS } from '@/shared/lib/constants';

// ==========================================
// CONSTANTS
// ==========================================
const ATS_TIPS = [
  'Use bullet points (3-5 per role)',
  'Start with action verbs (Led, Developed, Increased)',
  'Quantify results (reduced by 30%, managed $2M budget)',
  'Focus on impact, not tasks',
  'List most recent first',
];

// ==========================================
// HELPERS
// Defined outside component — stable reference, no re-creation on render
// createEmptyExperience passed to hook as createItem — no useCallback needed
// isNotEmpty passed as filterEmpty — blank entries excluded from Redux save
// ==========================================
function createEmptyExperience() {
  return {
    jobTitle: '',
    company: '',
    location: '',
    startDate: null,
    endDate: null,
    currentlyWorking: false,
    responsibilities: [''],
  };
}

function isNotEmpty(experience) {
  return experience.jobTitle?.trim() || experience.company?.trim();
}

/**
 * WorkExperienceForm Component
 * Step 3: Work Experience
 */
function WorkExperienceForm() {
  const resumeData = useCurrentResumeData();

  // ==========================================
  // LIST FORM HOOK
  // All init, save, add/remove/update/reorder logic lives in useResumeListForm.
  // handleAdd returns false if max limit reached — show alert in UI.
  // ==========================================
  const {
    items: experiences,
    handleAdd,
    handleRemove,
    handleUpdate,
    handleReorder,
  } = useResumeListForm({
    field: 'workExperience',
    createItem: createEmptyExperience,
    reduxData: resumeData?.workExperience,
    maxItems: LIMITS.MAX_WORK_EXPERIENCES,
    filterEmpty: isNotEmpty,
  });

  // ==========================================
  // VALIDATION
  // Run on current experiences for UI feedback only
  // Does not block saving — partial data is allowed
  // ==========================================
  const errors = validateWorkExperienceForm(experiences);
  const hasValidationErrors =
    Object.keys(errors).length > 0 && errors._form === undefined;

  // ==========================================
  // HANDLERS
  // ==========================================
  const onAdd = () => {
    const added = handleAdd();
    if (!added) {
      alert(`Maximum ${LIMITS.MAX_WORK_EXPERIENCES} experiences allowed`);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ATS GUIDELINES */}
      <ATSBanner title="ATS-Optimized Experience Tips" tips={ATS_TIPS} />

      {/* VALIDATION ERRORS SUMMARY */}
      {hasValidationErrors && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-800 mb-2">
            ⚠️ Validation Issues Found:
          </p>
          <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
            {Object.entries(errors).map(([key, value]) => {
              if (key === '_form') return null;
              return (
                <li key={key}>
                  Experience #{parseInt(key) + 1}:{' '}
                  {typeof value === 'object' ? 'Multiple errors' : value}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* EXPERIENCES LIST */}
      <div className="space-y-6">
        {experiences.map((experience, index) => {
          const qualityScore = getExperienceQualityScore(experience);
          const hasErrors =
            errors[index] && Object.keys(errors[index]).length > 0;

          return (
            <div key={index} className="relative">
              {/* Error Indicator */}
              {hasErrors && (
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                    !
                  </span>
                </div>
              )}

              {/* Quality Score Badge */}
              {!hasErrors && qualityScore.score >= 70 && (
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white text-xs font-bold">
                    ✓
                  </span>
                </div>
              )}

              <ExperienceItem
                index={index}
                experience={experience}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
                onMoveUp={
                  index > 0 ? () => handleReorder(index, index - 1) : null
                }
                onMoveDown={
                  index < experiences.length - 1
                    ? () => handleReorder(index, index + 1)
                    : null
                }
              />

              {/* Quality Suggestions */}
              {qualityScore.suggestions.length > 0 && (
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-teal-800 mb-1">
                    💡 Suggestions (Score: {qualityScore.score}/100):
                  </p>
                  <ul className="text-xs text-teal-700 space-y-0.5 list-disc list-inside">
                    {qualityScore.suggestions
                      .slice(0, 3)
                      .map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ADD BUTTON */}
      <AddExperienceButton currentCount={experiences.length} onClick={onAdd} />
    </div>
  );
}

export default memo(WorkExperienceForm);
