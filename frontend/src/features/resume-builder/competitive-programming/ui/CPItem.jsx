'use client';
/**
 * @file features/resume-builder/competitive-programming/ui/CPItem.jsx
 * @description Single competitive programming profile card
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * - PLATFORMS and BADGE_SUGGESTIONS defined outside component — stable reference
 * - problemsSolved: type="text" (backend stores as String max 20)
 * - Number() coercion removed from onChange
 */

import { memo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ResumeInput from '@/shared/components/atoms/resume/ResumeInput';
import TagInput from '@/shared/components/atoms/resume/TagInput';
import { LIMITS } from '@/shared/lib/constants';

const PLATFORMS = [
  'LeetCode',
  'Codeforces',
  'HackerRank',
  'CodeChef',
  'AtCoder',
  'TopCoder',
  'SPOJ',
  'Kattis',
];

const BADGE_SUGGESTIONS = [
  'Expert',
  'Master',
  'Grandmaster',
  '5-Star',
  '6-Star',
  '7-Star',
  'Knight',
  'Guardian',
  'Contest Winner',
  'Global Rank',
];

function CPItem({
  index,
  profile,
  errors = {},
  autoFocus = false,
  onUpdate,
  onRemove,
}) {
  const selectRef = useRef(null);

  /** Focus the platform dropdown when a new empty card is added */
  useEffect(() => {
    if (autoFocus && selectRef.current) {
      selectRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="border-2 border-gray-200 rounded-lg p-6 bg-white hover:border-teal-300 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Platform #{index + 1}
        </h3>

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          aria-label="Delete platform"
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
            ref={selectRef}
            value={profile.platform || ''}
            onChange={(e) => onUpdate(index, 'platform', e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
              errors.platform ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select Platform</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.platform && (
            <p className="mt-1 text-xs text-red-600">{errors.platform}</p>
          )}
        </div>

        <ResumeInput
          label="Problems Solved"
          name="problemsSolved"
          type="text"
          value={profile.problemsSolved || ''}
          onChange={(e) => onUpdate(index, 'problemsSolved', e.target.value)}
          placeholder="500"
          maxLength={20}
          helperText="e.g. 500, 1K, 500+"
          error={errors.problemsSolved}
        />

        <TagInput
          label="Badges & Achievements"
          name="badges"
          tags={profile.badges || []}
          onAdd={(badge) =>
            onUpdate(index, 'badges', [...(profile.badges || []), badge])
          }
          onRemove={(badge) =>
            onUpdate(
              index,
              'badges',
              (profile.badges || []).filter((b) => b !== badge)
            )
          }
          suggestions={BADGE_SUGGESTIONS}
          maxTags={LIMITS.MAX_BADGES}
          placeholder="Expert, 5-Star (press Enter)"
        />

        <ResumeInput
          label="Profile URL"
          name="profileUrl"
          type="url"
          value={profile.profileUrl || ''}
          onChange={(e) => onUpdate(index, 'profileUrl', e.target.value)}
          placeholder="https://leetcode.com/username"
          helperText="Optional — add for verification"
          error={errors.profileUrl}
        />

        {profile.platform && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 <strong>Tip:</strong> For {profile.platform}, include your
              rating, ranking, or contest participation to stand out.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

CPItem.propTypes = {
  index: PropTypes.number.isRequired,
  profile: PropTypes.object.isRequired,
  errors: PropTypes.object,
  autoFocus: PropTypes.bool,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default memo(CPItem);
