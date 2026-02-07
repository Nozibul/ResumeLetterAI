/**
 * @file shared/components/atoms/resume/ATSBanner.jsx
 * @description Reusable ATS guidelines banner
 * @author Nozibul Islam
 *
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * ATSBanner Component
 * Displays ATS-friendly tips
 */
function ATSBanner({ title, tips, className }) {
  return (
    <div
      className={`bg-teal-50 border border-teal-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <svg
          className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        {/* Content */}
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-teal-700 mb-1">{title}</h4>
          <ul className="text-xs text-teal-800 space-y-1">
            {tips.map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

ATSBanner.propTypes = {
  title: PropTypes.string.isRequired,
  tips: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
};

ATSBanner.defaultProps = {
  className: '',
};

export default memo(ATSBanner);
