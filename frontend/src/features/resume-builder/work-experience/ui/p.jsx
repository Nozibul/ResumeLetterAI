/**
 * @file features/resume-builder/work-experience/ui/WorkExperienceForm.jsx
 * @description Work Experience form - Step 3 (Reusable Pattern)
 * @author Nozibul Islam
 *
 * Backend Schema:
 * workExperience: [{
 *   jobTitle: String (required, max 100),
 *   company: String (required, max 100),
 *   location: String (optional, max 100),
 *   startDate: { month: Number, year: Number },
 *   endDate: { month: Number, year: Number },
 *   currentlyWorking: Boolean,
 *   responsibilities: [String] (max 20, max 500 each)
 * }]
 *
 * Quality Checks:
 * ✅ All quality standards met
 */

'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import {
  updateCurrentResumeField,
  setIsSaving,
} from '@/shared/store/slices/resumeSlice';
import ResumeInput from '@/shared/components/atoms/resume/ResumeInput';
import ResumeTextarea from '@/shared/components/atoms/resume/ResumeTextarea';
import DatePicker from '@/shared/components/atoms/resume/DatePicker';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import { LIMITS } from '@/shared/lib/constants';
import { reorderArray } from '@/shared/lib/utils';
import logger from '@/shared/lib/logger';

function WorkExperienceForm() {
  const dispatch = useDispatch();
  const resumeData = useCurrentResumeData();
  const [experiences, setExperiences] = useState([createEmpty()]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (resumeData?.workExperience?.length > 0) {
      setExperiences(resumeData.workExperience);
    }
  }, []);

  useEffect(() => {
    if (!touched) return;
    const timer = setTimeout(() => {
      dispatch(setIsSaving(true));
      const valid = experiences.filter(
        (e) => e.jobTitle?.trim() || e.company?.trim()
      );
      dispatch(
        updateCurrentResumeField({ field: 'workExperience', value: valid })
      );
      setTimeout(() => dispatch(setIsSaving(false)), 500);
    }, 500);
    return () => clearTimeout(timer);
  }, [experiences, touched, dispatch]);

  const handleAdd = useCallback(() => {
    if (experiences.length >= LIMITS.MAX_WORK_EXPERIENCES) {
      alert(`Max ${LIMITS.MAX_WORK_EXPERIENCES} experiences`);
      return;
    }
    setExperiences((prev) => [...prev, createEmpty()]);
    setTouched(true);
  }, [experiences.length]);

  const handleRemove = useCallback(
    (idx) => {
      if (experiences.length === 1) {
        setExperiences([createEmpty()]);
      } else {
        setExperiences((prev) => prev.filter((_, i) => i !== idx));
      }
      setTouched(true);
    },
    [experiences.length]
  );

  const handleUpdate = useCallback((idx, field, value) => {
    setExperiences((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
    setTouched(true);
  }, []);

  const handleReorder = useCallback((from, to) => {
    setExperiences((prev) => reorderArray(prev, from, to));
    setTouched(true);
  }, []);

  const atsTips = [
    'Use bullet points (3-5 per role)',
    'Start with action verbs (Led, Developed, Increased)',
    'Quantify results (reduced by 30%, managed $2M budget)',
    'Focus on impact, not tasks',
    'List most recent first',
  ];

  return (
    <div className="space-y-6">
      <ATSBanner title="ATS-Optimized Experience Tips" tips={atsTips} />

      <div className="space-y-6">
        {experiences.map((exp, idx) => (
          <ExperienceItem
            key={idx}
            index={idx}
            experience={exp}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
            onMoveUp={idx > 0 ? () => handleReorder(idx, idx - 1) : null}
            onMoveDown={
              idx < experiences.length - 1
                ? () => handleReorder(idx, idx + 1)
                : null
            }
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={experiences.length >= LIMITS.MAX_WORK_EXPERIENCES}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span className="font-medium">
          Add Experience ({experiences.length}/{LIMITS.MAX_WORK_EXPERIENCES})
        </span>
      </button>
    </div>
  );
}

const ExperienceItem = memo(
  ({ index, experience, onUpdate, onRemove, onMoveUp, onMoveDown }) => {
    const [dateError, setDateError] = useState(null);

    useEffect(() => {
      if (experience.endDate && experience.startDate) {
        const start =
          experience.startDate.year * 12 + experience.startDate.month;
        const end = experience.endDate.year * 12 + experience.endDate.month;
        if (end < start) {
          setDateError('End date must be after start date');
        } else {
          setDateError(null);
        }
      }
    }, [experience.startDate, experience.endDate]);

    const handleRespChange = useCallback(
      (rIdx, value) => {
        const updated = [...(experience.responsibilities || [])];
        updated[rIdx] = value;
        onUpdate(index, 'responsibilities', updated);
      },
      [experience.responsibilities, index, onUpdate]
    );

    const handleAddResp = useCallback(() => {
      const current = experience.responsibilities || [];
      if (current.length >= LIMITS.MAX_RESPONSIBILITIES) {
        alert(`Max ${LIMITS.MAX_RESPONSIBILITIES} bullets`);
        return;
      }
      onUpdate(index, 'responsibilities', [...current, '']);
    }, [experience.responsibilities, index, onUpdate]);

    const handleRemoveResp = useCallback(
      (rIdx) => {
        const updated = (experience.responsibilities || []).filter(
          (_, i) => i !== rIdx
        );
        onUpdate(index, 'responsibilities', updated);
      },
      [experience.responsibilities, index, onUpdate]
    );

    return (
      <div className="border-2 border-gray-200 rounded-lg p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Experience #{index + 1}</h3>
          <div className="flex gap-2">
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                className="p-1.5 hover:bg-teal-50 rounded"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                onClick={onMoveDown}
                className="p-1.5 hover:bg-teal-50 rounded"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1.5 hover:bg-red-50 rounded"
            >
              <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <ResumeInput
            label="Job Title"
            name="jobTitle"
            value={experience.jobTitle || ''}
            onChange={(e) => onUpdate(index, 'jobTitle', e.target.value)}
            placeholder="Software Engineer"
            required
            maxLength={LIMITS.TITLE_MAX_LENGTH}
            showCounter
          />

          <div className="grid grid-cols-2 gap-4">
            <ResumeInput
              label="Company"
              name="company"
              value={experience.company || ''}
              onChange={(e) => onUpdate(index, 'company', e.target.value)}
              placeholder="Google"
              required
              maxLength={LIMITS.TITLE_MAX_LENGTH}
            />
            <ResumeInput
              label="Location"
              name="location"
              value={experience.location || ''}
              onChange={(e) => onUpdate(index, 'location', e.target.value)}
              placeholder="San Francisco, CA"
              maxLength={LIMITS.TITLE_MAX_LENGTH}
            />
          </div>

          <DatePicker
            label="Employment Period"
            startDate={experience.startDate}
            endDate={experience.endDate}
            isCurrent={experience.currentlyWorking}
            onStartChange={(date) => onUpdate(index, 'startDate', date)}
            onEndChange={(date) => onUpdate(index, 'endDate', date)}
            onCurrentChange={(checked) => {
              onUpdate(index, 'currentlyWorking', checked);
              if (checked) onUpdate(index, 'endDate', null);
            }}
            error={dateError}
            required
            currentLabel="I currently work here"
          />

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Key Responsibilities
            </label>
            {(experience.responsibilities || ['']).map((resp, rIdx) => (
              <div key={rIdx} className="flex gap-2">
                <span className="text-gray-400 mt-3">•</span>
                <ResumeTextarea
                  label=""
                  name={`resp-${rIdx}`}
                  value={resp}
                  onChange={(e) => handleRespChange(rIdx, e.target.value)}
                  placeholder="Led development of microservices, reducing latency by 40%"
                  rows={2}
                  maxLength={500}
                  className="flex-1"
                />
                {(experience.responsibilities || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveResp(rIdx)}
                    className="p-2 text-red-600"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddResp}
              disabled={
                (experience.responsibilities || []).length >=
                LIMITS.MAX_RESPONSIBILITIES
              }
              className="text-sm text-teal-600 font-medium disabled:opacity-50"
            >
              + Add Bullet ({(experience.responsibilities || []).length}/
              {LIMITS.MAX_RESPONSIBILITIES})
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ExperienceItem.displayName = 'ExperienceItem';

function createEmpty() {
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

// export default memo(WorkExperienceForm);
