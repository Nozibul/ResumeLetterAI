/**
 * @file features/resume-builder/education/ui/EducationForm.jsx
 * @description Education form - Step 6 (Reusable Pattern)
 * @author Nozibul Islam
 *
 * Backend Schema:
 * education: [{
 *   degree: String (required, max 100),
 *   institution: String (required, max 100),
 *   location: String (optional, max 100),
 *   graduationDate: { month: Number, year: Number },
 *   gpa: String (optional)
 * }]
 *
 * Quality Checks:
 * ✅ All standards met
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
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import { LIMITS } from '@/shared/lib/constants';
import { reorderArray } from '@/shared/lib/utils';

function EducationForm() {
  const dispatch = useDispatch();
  const resumeData = useCurrentResumeData();
  const [educations, setEducations] = useState([createEmpty()]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (resumeData?.education?.length > 0) {
      setEducations(resumeData.education);
    }
  }, []);

  useEffect(() => {
    if (!touched) return;
    const timer = setTimeout(() => {
      dispatch(setIsSaving(true));
      const valid = educations.filter(
        (e) => e.degree?.trim() || e.institution?.trim()
      );
      dispatch(updateCurrentResumeField({ field: 'education', value: valid }));
      setTimeout(() => dispatch(setIsSaving(false)), 500);
    }, 500);
    return () => clearTimeout(timer);
  }, [educations, touched, dispatch]);

  const handleAdd = useCallback(() => {
    if (educations.length >= LIMITS.MAX_EDUCATION) {
      alert(`Max ${LIMITS.MAX_EDUCATION} education entries`);
      return;
    }
    setEducations((prev) => [...prev, createEmpty()]);
    setTouched(true);
  }, [educations.length]);

  const handleRemove = useCallback(
    (idx) => {
      if (educations.length === 1) {
        setEducations([createEmpty()]);
      } else {
        setEducations((prev) => prev.filter((_, i) => i !== idx));
      }
      setTouched(true);
    },
    [educations.length]
  );

  const handleUpdate = useCallback((idx, field, value) => {
    setEducations((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
    setTouched(true);
  }, []);

  const handleReorder = useCallback((from, to) => {
    setEducations((prev) => reorderArray(prev, from, to));
    setTouched(true);
  }, []);

  const atsTips = [
    'List most recent degree first',
    'Include GPA if 3.0 or higher',
    'Mention relevant coursework for entry-level positions',
    "Include honors, awards, or Dean's List if applicable",
  ];

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <ATSBanner title="Education Section Tips" tips={atsTips} />

      <div className="space-y-6">
        {educations.map((edu, idx) => (
          <div
            key={idx}
            className="border-2 border-gray-200 rounded-lg p-6 bg-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Education #{idx + 1}</h3>
              <div className="flex gap-2">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, idx - 1)}
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
                {idx < educations.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, idx + 1)}
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
                  onClick={() => handleRemove(idx)}
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
                label="Degree"
                name="degree"
                value={edu.degree || ''}
                onChange={(e) => handleUpdate(idx, 'degree', e.target.value)}
                placeholder="Bachelor of Science in Computer Science"
                required
                maxLength={LIMITS.TITLE_MAX_LENGTH}
                showCounter
              />

              <div className="grid grid-cols-2 gap-4">
                <ResumeInput
                  label="Institution"
                  name="institution"
                  value={edu.institution || ''}
                  onChange={(e) =>
                    handleUpdate(idx, 'institution', e.target.value)
                  }
                  placeholder="MIT"
                  required
                  maxLength={LIMITS.TITLE_MAX_LENGTH}
                />
                <ResumeInput
                  label="Location"
                  name="location"
                  value={edu.location || ''}
                  onChange={(e) =>
                    handleUpdate(idx, 'location', e.target.value)
                  }
                  placeholder="Cambridge, MA"
                  maxLength={LIMITS.TITLE_MAX_LENGTH}
                  helperText="Optional"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Graduation Month
                  </label>
                  <select
                    value={edu.graduationDate?.month || ''}
                    onChange={(e) =>
                      handleUpdate(idx, 'graduationDate', {
                        ...edu.graduationDate,
                        month: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Month</option>
                    {months.map((m, i) => (
                      <option key={i} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Graduation Year
                  </label>
                  <select
                    value={edu.graduationDate?.year || ''}
                    onChange={(e) =>
                      handleUpdate(idx, 'graduationDate', {
                        ...edu.graduationDate,
                        year: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <ResumeInput
                  label="GPA"
                  name="gpa"
                  value={edu.gpa || ''}
                  onChange={(e) => handleUpdate(idx, 'gpa', e.target.value)}
                  placeholder="3.8"
                  helperText="0-4 scale"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={educations.length >= LIMITS.MAX_EDUCATION}
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
          Add Education ({educations.length}/{LIMITS.MAX_EDUCATION})
        </span>
      </button>
    </div>
  );
}

function createEmpty() {
  return {
    degree: '',
    institution: '',
    location: '',
    graduationDate: null,
    gpa: '',
  };
}

export default memo(EducationForm);
