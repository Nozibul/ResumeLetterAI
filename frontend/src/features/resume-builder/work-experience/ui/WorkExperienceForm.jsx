/**
 * @file features/resume-builder/work-experience/ui/WorkExperienceForm.jsx
 * @description Work Experience form - Step 3 (FINAL - WITH VALIDATION)
 * @author Nozibul Islam
 *
 * Architecture:
 * - Uses sub-components (ExperienceItem, BulletPointsList, AddExperienceButton)
 * - Uses validation from model/validation.js
 * - Date range validation
 * - Responsibilities validation
 *
 */

'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import {
  updateCurrentResumeField,
  setIsSaving,
} from '@/shared/store/slices/resumeSlice';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import ExperienceItem from './ExperienceItem';
import AddExperienceButton from './AddExperienceButton';
import {
  validateWorkExperienceForm,
  getExperienceQualityScore,
} from '../model/validation';
import { LIMITS } from '@/shared/lib/constants';
import { reorderArray } from '@/shared/lib/utils';
import logger from '@/shared/lib/logger';

/**
 * WorkExperienceForm Component
 * Step 3: Work Experience with validation
 */
function WorkExperienceForm() {
  const dispatch = useDispatch();
  const resumeData = useCurrentResumeData();

  // ==========================================
  // STATE
  // ==========================================
  const [experiences, setExperiences] = useState([createEmptyExperience()]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  // ==========================================
  // INITIALIZE FROM REDUX
  // ==========================================
  useEffect(() => {
    if (resumeData?.workExperience?.length > 0) {
      setExperiences(resumeData.workExperience);
    }
  }, []);

  // ==========================================
  // VALIDATE ALL EXPERIENCES
  // ==========================================
  const validateAllExperiences = useCallback((experiencesList) => {
    const validationErrors = validateWorkExperienceForm(experiencesList);
    setErrors(validationErrors);
    return validationErrors;
  }, []);

  // ==========================================
  // DEBOUNCED SAVE
  // ==========================================
  useEffect(() => {
    if (!touched) return;

    const timer = setTimeout(() => {
      logger.info('Saving work experience to Redux...');
      dispatch(setIsSaving(true));

      // Validate before saving
      validateAllExperiences(experiences);

      // Filter out empty experiences
      const validExperiences = experiences.filter(
        (e) => e.jobTitle?.trim() || e.company?.trim()
      );

      dispatch(
        updateCurrentResumeField({
          field: 'workExperience',
          value: validExperiences,
        })
      );

      setTimeout(() => dispatch(setIsSaving(false)), 500);
    }, 500);

    return () => clearTimeout(timer);
  }, [experiences, touched, dispatch, validateAllExperiences]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleAdd = useCallback(() => {
    if (experiences.length >= LIMITS.MAX_WORK_EXPERIENCES) {
      alert(`Maximum ${LIMITS.MAX_WORK_EXPERIENCES} experiences allowed`);
      return;
    }
    setExperiences((prev) => [...prev, createEmptyExperience()]);
    setTouched(true);
    logger.info('Added new work experience');
  }, [experiences.length]);

  const handleRemove = useCallback(
    (index) => {
      if (experiences.length === 1) {
        setExperiences([createEmptyExperience()]);
      } else {
        setExperiences((prev) => prev.filter((_, i) => i !== index));
      }
      setTouched(true);
      logger.info('Removed work experience:', index);
    },
    [experiences.length]
  );

  const handleUpdate = useCallback((index, field, value) => {
    setExperiences((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setTouched(true);
  }, []);

  const handleReorder = useCallback((fromIndex, toIndex) => {
    setExperiences((prev) => reorderArray(prev, fromIndex, toIndex));
    setTouched(true);
    logger.info(`Reordered experience: ${fromIndex} → ${toIndex}`);
  }, []);

  // ==========================================
  // GET QUALITY SCORES
  // ==========================================
  // const getQualityScores = useCallback(() => {
  //   return experiences.map((exp) => getExperienceQualityScore(exp));
  // }, [experiences]);

  // ==========================================
  // ATS TIPS
  // ==========================================
  const atsTips = [
    'Use bullet points (3-5 per role)',
    'Start with action verbs (Led, Developed, Increased)',
    'Quantify results (reduced by 30%, managed $2M budget)',
    'Focus on impact, not tasks',
    'List most recent first',
  ];

  // ==========================================
  // VALIDATION SUMMARY
  // ==========================================
  const hasValidationErrors =
    Object.keys(errors).length > 0 && errors._form === undefined;

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ATS GUIDELINES */}
      <ATSBanner title="ATS-Optimized Experience Tips" tips={atsTips} />

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
      <AddExperienceButton
        currentCount={experiences.length}
        onClick={handleAdd}
      />
    </div>
  );
}

// ==========================================
// HELPER: Create Empty Experience
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

export default memo(WorkExperienceForm);
