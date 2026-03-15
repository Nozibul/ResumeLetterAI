/**
 * @file features/resume-builder/competitive-programming/ui/CPForm.jsx
 * @description Competitive Programming form - Step 7
 * @author Nozibul Islam
 *
 * Refactored to use shared useResumeListForm hook.
 * All init, save, add/remove/update logic lives in the hook.
 * Component is responsible for UI only.
 *
 * Note: profiles starts as [] (not [createEmptyProfile()])
 * because empty state has its own UI with an "Add Platform" button.
 * createItem is passed to hook for handleAdd and handleRemove fallback.
 */

'use client';

import { memo, useCallback, useMemo } from 'react';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import { useResumeListForm } from '@/shared/hooks/useResumeListForm';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import CPItem from './CPItem';
import AddPlatformButton from './AddPlatformButton';
import { validateCPForm, getCPQualityScore } from '../model/validation';
import { LIMITS } from '@/shared/lib/constants';

// ==========================================
// CONSTANTS
// ==========================================
const ATS_TIPS = [
  'Include competitive programming if relevant to the role',
  'Highlight problem counts and rankings',
  'Mention notable achievements (contest wins, rating milestones)',
  'Add profile links for verification',
];

const MAX_PROFILES = LIMITS.MAX_CP_PLATFORMS ?? 5;

// ==========================================
// HELPERS
// Defined outside component — stable reference, no re-creation on render
// ==========================================
function createEmptyProfile() {
  return {
    platform: '',
    problemsSolved: 0,
    badges: [],
    profileUrl: '',
  };
}

function isNotEmpty(profile) {
  return profile.platform?.trim();
}

/**
 * CPForm Component
 * Step 7: Competitive Programming
 */
function CPForm() {
  const resumeData = useCurrentResumeData();

  // ==========================================
  // LIST FORM HOOK
  // All init, save, add/remove/update logic lives in useResumeListForm.
  // No reorder — CP profiles don't need ordering.
  // handleAdd returns false if max limit reached — show alert in UI.
  // ==========================================
  const {
    items: profiles,
    handleAdd,
    handleRemove,
    handleUpdate,
  } = useResumeListForm({
    field: 'competitiveProgramming',
    createItem: createEmptyProfile,
    reduxData: resumeData?.competitiveProgramming,
    maxItems: MAX_PROFILES,
    filterEmpty: isNotEmpty,
  });

  // ==========================================
  // VALIDATION
  // Run on current profiles for UI feedback only
  // ==========================================
  const errors = useMemo(() => validateCPForm(profiles), [profiles]);

  const hasValidationErrors =
    Object.keys(errors).length > 0 && errors._form === undefined;

  // Single source of truth — avoids mirrored conditions
  // isEmpty: no platform filled yet — show empty state UI
  // hasAnyProfile: at least one platform filled — show list + add button
  const isEmpty = profiles.length === 1 && !profiles[0]?.platform?.trim();
  const hasAnyProfile = profiles.some((p) => p.platform?.trim());

  // ==========================================
  // HANDLERS
  // ==========================================
  const onAdd = useCallback(() => {
    const added = handleAdd();
    if (!added) {
      alert(`Maximum ${MAX_PROFILES} platforms allowed`);
    }
  }, [handleAdd]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ATS GUIDELINES */}
      <ATSBanner title="Competitive Programming Tips" tips={ATS_TIPS} />

      {/* VALIDATION ERRORS SUMMARY */}
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
                  Platform #{parseInt(key) + 1}:{' '}
                  {typeof value === 'object' ? 'Check fields' : value}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* EMPTY STATE
          profiles[0] is a blank createEmptyProfile() from hook init.
          Treat it as empty state if platform is not filled yet.
      */}
      {isEmpty && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="max-w-sm mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No Competitive Programming Profiles
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add your LeetCode, Codeforces, or other CP profiles
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <svg
                  className="h-5 w-5 mr-2"
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
                Add Platform
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILES LIST */}
      {!isEmpty && (
        <div className="space-y-6">
          {profiles.map((profile, index) => {
            const qualityScore = getCPQualityScore(profile);
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
                {!hasErrors && qualityScore.score === 100 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">
                      ✓
                    </span>
                  </div>
                )}

                <CPItem
                  index={index}
                  profile={profile}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                />

                {/* Quality Suggestions */}
                {qualityScore.suggestions.length > 0 && (
                  <div className="mt-2 bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-teal-800 mb-1">
                      💡 Suggestions (Score: {qualityScore.score}/100):
                    </p>
                    <ul className="text-xs text-teal-700 space-y-0.5 list-disc list-inside">
                      {qualityScore.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ADD BUTTON */}
      {hasAnyProfile && profiles.length < MAX_PROFILES && (
        <AddPlatformButton currentCount={profiles.length} onClick={onAdd} />
      )}
    </div>
  );
}

export default memo(CPForm);
