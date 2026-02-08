/**
 * @file features/resume-builder/education/ui/AddEducationButton.jsx
 * @description Add education button component
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
 * AddEducationButton Component
 * Button to add new education entry
 */
function AddEducationButton({ currentCount, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || currentCount >= LIMITS.MAX_EDUCATION}
      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
      aria-label="Add new education"
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
        Add Education ({currentCount}/{LIMITS.MAX_EDUCATION})
      </span>
    </button>
  );
}

AddEducationButton.propTypes = {
  currentCount: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

AddEducationButton.defaultProps = {
  disabled: false,
};

export default memo(AddEducationButton);
