/**
 * @file features/resume-builder/certifications/ui/AddCertButton.jsx
 * @description Add certification button component
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
 * AddCertButton Component
 * Button to add new certification
 */
function AddCertButton({ currentCount, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || currentCount >= LIMITS.MAX_CERTIFICATIONS}
      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
      aria-label="Add new certification"
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
        Add Certification ({currentCount}/{LIMITS.MAX_CERTIFICATIONS})
      </span>
    </button>
  );
}

AddCertButton.propTypes = {
  currentCount: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

AddCertButton.defaultProps = {
  disabled: false,
};

export default memo(AddCertButton);
