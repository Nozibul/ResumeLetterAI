/**
 * @file widgets/resume-builder/FormArea/FormHeader.jsx
 * @description Form header with step information and actions
 * @author Nozibul Islam
 *
 * Features:
 * - Step number and title display
 * - Step description/instructions
 * - Auto-save status indicator
 * - Mobile preview toggle button
 * - Responsive layout
 *
 * Performance:
 * - Memoized component
 * - No unnecessary re-renders
 *
 * Accessibility:
 * - Semantic HTML (header tag)
 * - ARIA labels for buttons
 * - Screen reader friendly
 */

'use client';

import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * FormHeader Component
 * Top section of form area with step info
 */
function FormHeader({
  stepNumber,
  stepTitle,
  stepDescription,
  isSaving,
  onPreviewToggle,
}) {
  // ==========================================
  // INPUT VALIDATION
  // ==========================================
  const validStepNumber =
    typeof stepNumber === 'number' && stepNumber >= 1 && stepNumber <= 9
      ? stepNumber
      : 1;

  const validStepTitle =
    typeof stepTitle === 'string' && stepTitle.trim().length > 0
      ? stepTitle
      : 'Step';

  const validStepDescription =
    typeof stepDescription === 'string' && stepDescription.trim().length > 0
      ? stepDescription
      : '';

  const validIsSaving = typeof isSaving === 'boolean' ? isSaving : false;

  // ==========================================
  // AUTO-SAVE STATUS (Memoized)
  // ==========================================
  const saveStatus = useMemo(() => {
    if (validIsSaving) {
      return {
        text: 'Saving...',
        icon: (
          <svg
            className="animate-spin h-4 w-4 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ),
        color: 'text-blue-600',
      };
    }

    return {
      text: 'Saved',
      icon: (
        <svg
          className="h-4 w-4 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
      color: 'text-green-600',
    };
  }, [validIsSaving]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <header className="border-b border-gray-200 bg-white px-8 py-6">
      <div className="max-w-3xl mx-auto">
        {/* ==========================================
            TOP ROW - Step Number + Auto-Save + Preview Toggle
        ========================================== */}
        <div className="flex items-center justify-between mb-3">
          {/* Step number badge */}
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm"
              aria-label={`Step ${validStepNumber} of 9`}
            >
              {validStepNumber}
            </span>
            <span className="text-sm text-gray-500 font-medium">of 9</span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Auto-save indicator */}
            <div
              className={`flex items-center gap-2 text-sm font-medium ${saveStatus.color}`}
              role="status"
              aria-live="polite"
            >
              {saveStatus.icon}
              <span>{saveStatus.text}</span>
            </div>

            {/* Mobile preview toggle (visible only on mobile) */}
            <button
              type="button"
              onClick={onPreviewToggle}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle resume preview"
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span className="font-medium">Preview</span>
            </button>
          </div>
        </div>

        {/* ==========================================
            STEP TITLE
        ========================================== */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {validStepTitle}
        </h2>

        {/* ==========================================
            STEP DESCRIPTION
        ========================================== */}
        {validStepDescription && (
          <p className="text-sm text-gray-600">{validStepDescription}</p>
        )}
      </div>
    </header>
  );
}

// ==========================================
// PROP TYPES
// ==========================================
FormHeader.propTypes = {
  stepNumber: PropTypes.number.isRequired,
  stepTitle: PropTypes.string.isRequired,
  stepDescription: PropTypes.string,
  isSaving: PropTypes.bool,
  onPreviewToggle: PropTypes.func,
};

FormHeader.defaultProps = {
  stepDescription: '',
  isSaving: false,
  onPreviewToggle: () => {},
};

// ==========================================
// MEMOIZATION
// ==========================================
export default memo(FormHeader);
