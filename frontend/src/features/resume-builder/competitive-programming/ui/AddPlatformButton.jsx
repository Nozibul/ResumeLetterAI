/**
 * @file features/resume-builder/competitive-programming/ui/AddPlatformButton.jsx
 * @description Add platform button component
 * @author Nozibul Islam
 *
 * Self-Review:
 * ✅ Readability: Simple
 * ✅ Performance: Memoized
 * ✅ Security: No XSS
 * ✅ Best Practices: Accessible
 * ✅ Potential Bugs: None
 * ✅ Memory Leaks: None
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';
import { LIMITS } from '@/shared/lib/constants';

/**
 * AddPlatformButton Component
 * Button to add new CP platform
 */
function AddPlatformButton({ currentCount, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || currentCount >= LIMITS.MAX_CP_PROFILES}
      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
      aria-label="Add new platform"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      <span className="font-medium">
        Add Another Platform ({currentCount}/{LIMITS.MAX_CP_PROFILES})
      </span>
    </button>
  );
}

AddPlatformButton.propTypes = {
  currentCount: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

AddPlatformButton.defaultProps = {
  disabled: false,
};

export default memo(AddPlatformButton);
