/**
 * @file features/resume-builder/competitive-programming/ui/CPForm.jsx
 * @description Competitive Programming form - Step 7 (Reusable Pattern)
 * @author Nozibul Islam
 *
 * Backend Schema:
 * competitiveProgramming: [{
 *   platform: String (required),
 *   problemsSolved: Number,
 *   badges: [String],
 *   profileUrl: String (optional)
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
import TagInput from '@/shared/components/atoms/resume/TagInput';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import { LIMITS } from '@/shared/lib/constants';

function CPForm() {
  const dispatch = useDispatch();
  const resumeData = useCurrentResumeData();
  const [profiles, setProfiles] = useState([]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (resumeData?.competitiveProgramming?.length > 0) {
      setProfiles(resumeData.competitiveProgramming);
    }
  }, []);

  useEffect(() => {
    if (!touched) return;
    const timer = setTimeout(() => {
      dispatch(setIsSaving(true));
      const valid = profiles.filter((p) => p.platform?.trim());
      dispatch(
        updateCurrentResumeField({
          field: 'competitiveProgramming',
          value: valid,
        })
      );
      setTimeout(() => dispatch(setIsSaving(false)), 500);
    }, 500);
    return () => clearTimeout(timer);
  }, [profiles, touched, dispatch]);

  const handleAdd = useCallback(() => {
    if (profiles.length >= LIMITS.MAX_CP_PROFILES) {
      alert(`Max ${LIMITS.MAX_CP_PROFILES} platforms`);
      return;
    }
    setProfiles((prev) => [...prev, createEmpty()]);
    setTouched(true);
  }, [profiles.length]);

  const handleRemove = useCallback((idx) => {
    setProfiles((prev) => prev.filter((_, i) => i !== idx));
    setTouched(true);
  }, []);

  const handleUpdate = useCallback((idx, field, value) => {
    setProfiles((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
    setTouched(true);
  }, []);

  const platforms = [
    'LeetCode',
    'Codeforces',
    'HackerRank',
    'CodeChef',
    'AtCoder',
    'TopCoder',
  ];
  const badgeSuggestions = [
    'Expert',
    'Master',
    'Grandmaster',
    '5-Star',
    '6-Star',
    '7-Star',
    'Knight',
    'Guardian',
    'Contest Winner',
  ];

  const atsTips = [
    'Include competitive programming if relevant to the role',
    'Highlight problem counts and rankings',
    'Mention notable achievements (contest wins, rating milestones)',
    'Add profile links for verification',
  ];

  return (
    <div className="space-y-6">
      <ATSBanner title="Competitive Programming Tips" tips={atsTips} />

      {profiles.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">
            No competitive programming profiles added yet
          </p>
          <button
            type="button"
            onClick={handleAdd}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Add Platform
          </button>
        </div>
      )}

      <div className="space-y-6">
        {profiles.map((prof, idx) => (
          <div
            key={idx}
            className="border-2 border-gray-200 rounded-lg p-6 bg-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Platform #{idx + 1}</h3>
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform <span className="text-red-500">*</span>
                </label>
                <select
                  value={prof.platform || ''}
                  onChange={(e) =>
                    handleUpdate(idx, 'platform', e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select Platform</option>
                  {platforms.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <ResumeInput
                label="Problems Solved"
                name="problemsSolved"
                type="number"
                value={prof.problemsSolved || ''}
                onChange={(e) =>
                  handleUpdate(idx, 'problemsSolved', Number(e.target.value))
                }
                placeholder="500"
                helperText="Total problems solved"
              />

              <TagInput
                label="Badges & Achievements"
                name="badges"
                tags={prof.badges || []}
                onAdd={(badge) =>
                  handleUpdate(idx, 'badges', [...(prof.badges || []), badge])
                }
                onRemove={(badge) =>
                  handleUpdate(
                    idx,
                    'badges',
                    (prof.badges || []).filter((b) => b !== badge)
                  )
                }
                suggestions={badgeSuggestions}
                maxTags={10}
                placeholder="Expert, 5-Star (press Enter)"
              />

              <ResumeInput
                label="Profile URL"
                name="profileUrl"
                type="url"
                value={prof.profileUrl || ''}
                onChange={(e) =>
                  handleUpdate(idx, 'profileUrl', e.target.value)
                }
                placeholder="https://leetcode.com/username"
                helperText="Optional"
              />
            </div>
          </div>
        ))}
      </div>

      {profiles.length > 0 && profiles.length < LIMITS.MAX_CP_PROFILES && (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all flex items-center justify-center gap-2"
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
            Add Another Platform ({profiles.length}/{LIMITS.MAX_CP_PROFILES})
          </span>
        </button>
      )}
    </div>
  );
}

function createEmpty() {
  return {
    platform: '',
    problemsSolved: 0,
    badges: [],
    profileUrl: '',
  };
}

export default memo(CPForm);
