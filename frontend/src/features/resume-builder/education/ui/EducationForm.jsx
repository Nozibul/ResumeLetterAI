'use client';
/**
 * @file features/resume-builder/education/ui/EducationForm.jsx
 * @description Education form - Step 6
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * - alert → toast.error
 * - _tempId added to createEmptyEducation for stable React keys
 * - key={education._tempId || index}
 * - quality suggestion key={suggestion} (stable)
 */

import { memo, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import { useResumeListForm } from '@/shared/hooks/useResumeListForm';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import EducationItem from './EducationItem';
import AddEducationButton from './AddEducationButton';
import {
  validateEducationForm,
  getEducationQualityScore,
} from '../model/validation';
import { LIMITS } from '@/shared/lib/constants';

// ── Constants ─────────────────────────────────────────────────────────────────

const ATS_TIPS = [
  'List most recent degree first',
  'Include GPA if 3.0 or higher',
  'Mention relevant coursework for entry-level positions',
  "Include honors, awards, or Dean's List if applicable",
];

// ── Helpers — defined outside component for stable reference ──────────────────

function createEmptyEducation() {
  return {
    _tempId: Date.now(),
    degree: '',
    institution: '',
    location: '',
    graduationDate: null,
    gpa: '',
  };
}

/** Only save entries that have at least a degree or institution */
function isNotEmpty(education) {
  return !!(education.degree?.trim() || education.institution?.trim());
}

// ── Component ─────────────────────────────────────────────────────────────────

function EducationForm() {
  const resumeData = useCurrentResumeData();

  const {
    items: educations,
    handleAdd,
    handleRemove,
    handleUpdate,
    handleReorder,
  } = useResumeListForm({
    field: 'education',
    createItem: createEmptyEducation,
    reduxData: resumeData?.education,
    maxItems: LIMITS.MAX_EDUCATIONS,
    filterEmpty: isNotEmpty,
  });

  // Validation — UI feedback only, does not block saving
  const errors = useMemo(() => validateEducationForm(educations), [educations]);

  const hasValidationErrors = Object.keys(errors).length > 0 && !errors._form;

  const onAdd = useCallback(() => {
    const added = handleAdd();
    if (!added) {
      toast.error(`Maximum ${LIMITS.MAX_EDUCATIONS} education entries allowed`);
    }
  }, [handleAdd]);

  return (
    <div className="space-y-6">
      <ATSBanner title="Education Section Tips" tips={ATS_TIPS} />

      {/* Validation summary */}
      {hasValidationErrors && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-800 mb-2">
            ⚠️ Validation Issues:
          </p>
          <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
            {Object.entries(errors).map(([key, value]) => {
              if (key === '_form') return null;
              return (
                <li key={key}>
                  Education #{parseInt(key) + 1}:{' '}
                  {typeof value === 'object' ? 'Check fields' : value}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Education list */}
      <div className="space-y-6">
        {educations.map((education, index) => {
          const qualityScore = getEducationQualityScore(education);
          const hasErrors =
            errors[index] && Object.keys(errors[index]).length > 0;

          return (
            <div key={education._tempId || index} className="relative">
              {/* Error indicator */}
              {hasErrors && (
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                    !
                  </span>
                </div>
              )}

              {/* Complete indicator */}
              {!hasErrors && qualityScore.score === 100 && (
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">
                    ✓
                  </span>
                </div>
              )}

              <EducationItem
                index={index}
                education={education}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
                onMoveUp={
                  index > 0 ? () => handleReorder(index, index - 1) : null
                }
                onMoveDown={
                  index < educations.length - 1
                    ? () => handleReorder(index, index + 1)
                    : null
                }
              />

              {/* Quality suggestions */}
              {qualityScore.suggestions.length > 0 && (
                <div className="mt-2 bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-teal-800 mb-1">
                    💡 Suggestions (Score: {qualityScore.score}/100):
                  </p>
                  <ul className="text-xs text-teal-700 space-y-0.5 list-disc list-inside">
                    {qualityScore.suggestions.map((suggestion) => (
                      <li key={suggestion}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AddEducationButton currentCount={educations.length} onClick={onAdd} />
    </div>
  );
}

export default memo(EducationForm);
