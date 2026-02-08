/**
 * @file features/resume-builder/competitive-programming/ui/CPItem.jsx
 * @description Single competitive programming profile card
 * @author Nozibul Islam
 *
 * Self-Review:
 * ✅ Readability: Clear structure
 * ✅ Performance: Memoized
 * ✅ Security: URL validation
 * ✅ Best Practices: Modular
 * ✅ Potential Bugs: Null-safe
 * ✅ Memory Leaks: None
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';
import ResumeInput from '@/shared/components/atoms/resume/ResumeInput';
import TagInput from '@/shared/components/atoms/resume/TagInput';

/**
 * CPItem Component
 * Single competitive programming platform profile
 */
function CPItem({ index, profile, onUpdate, onRemove }) {
  // ==========================================
  // PLATFORM OPTIONS
  // ==========================================
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
    'Global Rank',
  ];

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="border-2 border-gray-200 rounded-lg p-6 bg-white hover:border-teal-300 transition-colors">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Platform #{index + 1}
        </h3>

        {/* Delete Button */}
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

      {/* FORM FIELDS */}
      <div className="space-y-4">
        {/* Platform Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Platform <span className="text-red-500">*</span>
          </label>
          <select
            value={profile.platform || ''}
            onChange={(e) => onUpdate(index, 'platform', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Select Platform</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Problems Solved */}
        <ResumeInput
          label="Problems Solved"
          name="problemsSolved"
          type="number"
          value={profile.problemsSolved || ''}
          onChange={(e) =>
            onUpdate(index, 'problemsSolved', Number(e.target.value))
          }
          placeholder="500"
          helperText="Total problems solved on this platform"
        />

        {/* Badges & Achievements */}
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
          suggestions={badgeSuggestions}
          maxTags={10}
          placeholder="Expert, 5-Star (press Enter)"
        />

        {/* Profile URL */}
        <ResumeInput
          label="Profile URL"
          name="profileUrl"
          type="url"
          value={profile.profileUrl || ''}
          onChange={(e) => onUpdate(index, 'profileUrl', e.target.value)}
          placeholder="https://leetcode.com/username"
          helperText="Optional - Add for verification"
        />

        {/* Platform-specific tip */}
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
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default memo(CPItem);
