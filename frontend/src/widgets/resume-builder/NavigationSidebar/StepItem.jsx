/**
 * @file widgets/resume-builder/NavigationSidebar/StepItem.jsx
 * @description Individual step item with visual states
 * @author Nozibul Islam
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * StepItem Component
 * Single step in navigation sidebar
 */
function StepItem({
  stepNumber,
  label,
  isActive,
  isCompleted,
  onClick,
  onKeyDown,
}) {
  // ==========================================
  // INPUT VALIDATION
  // ==========================================
  const validStepNumber =
    typeof stepNumber === 'number' && stepNumber >= 1 && stepNumber <= 9
      ? stepNumber
      : 1;

  const validLabel =
    typeof label === 'string' && label.trim().length > 0 ? label : 'Step';

  // ==========================================
  // DYNAMIC CLASSES
  // ==========================================
  const buttonClasses = `
    w-full flex items-center gap-4 px-2 py-2 rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
    ${
      isActive
        ? 'border-1 border-teal-300 shadow-sm bg-teal-100 '
        : isCompleted
          ? 'bg-green-50 border border-teal-200 hover:bg-teal-100'
          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
    }
  `.trim();

  const numberClasses = `
    flex items-center justify-center
    w-7 h-7 rounded-full flex-shrink-0
    font-semibold text-sm
    transition-all duration-200
    ${
      isActive
        ? 'bg-teal-500 text-white'
        : isCompleted
          ? 'bg-green-500 text-white'
          : 'bg-gray-200 text-gray-800'
    }
  `.trim();

  const labelClasses = `
    flex-1 text-left font-medium text-md
    transition-colors duration-200
    ${isActive ? 'text-black' : isCompleted ? 'text-teal-600' : 'text-gray-700'}
  `.trim();
  return (
    <li>
      <button
        type="button"
        className={buttonClasses}
        onClick={onClick}
        onKeyDown={onKeyDown}
        aria-current={isActive ? 'step' : undefined}
        aria-label={`Step ${validStepNumber}: ${validLabel}${
          isCompleted ? ' (Completed)' : ''
        }${isActive ? ' (Current)' : ''}`}
      >
        {/* ==========================================
            STEP NUMBER / CHECKMARK
        ========================================== */}
        <div className={numberClasses}>
          {isCompleted ? (
            // Checkmark SVG (Completed state)
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            // Step number
            <span aria-hidden="true">{validStepNumber}</span>
          )}
        </div>

        {/* ==========================================
            STEP LABEL
        ========================================== */}
        <span className={labelClasses}>{validLabel}</span>

        {/* ==========================================
            ACTIVE INDICATOR (Visual only)
        ========================================== */}
        {isActive && (
          <div
            className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"
            aria-hidden="true"
          />
        )}
      </button>
    </li>
  );
}

// ==========================================
// PROP TYPES
// ==========================================
StepItem.propTypes = {
  stepNumber: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  isCompleted: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func,
};

StepItem.defaultProps = {
  isActive: false,
  isCompleted: false,
  onKeyDown: () => {},
};

// ==========================================
// MEMOIZATION
// Prevent re-renders unless props change
// ==========================================
export default memo(StepItem);
