/**
 * @file widgets/resume-builder/FormArea/FormFooter.jsx
 * @description Form navigation footer with Back/Next buttons
 * @author Nozibul Islam
 *
 * Features:
 * - Back button (conditional visibility)
 * - Next button with dynamic text
 * - Disabled state during save
 * - Preview button (mobile only)
 * - Responsive layout
 * - Keyboard navigation
 *
 * Performance:
 * - Memoized component
 * - No unnecessary re-renders
 *
 * Accessibility:
 * - ARIA labels
 * - Disabled state announcements
 * - Focus management
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * FormFooter Component
 * Bottom navigation bar with action buttons
 */
function FormFooter({
  showBackButton,
  nextButtonText,
  isLastStep,
  onBack,
  onNext,
  disabled,
}) {
  // ==========================================
  // INPUT VALIDATION
  // ==========================================
  const validShowBackButton =
    typeof showBackButton === 'boolean' ? showBackButton : false;
  const validIsLastStep = typeof isLastStep === 'boolean' ? isLastStep : false;
  const validDisabled = typeof disabled === 'boolean' ? disabled : false;

  const validNextButtonText =
    typeof nextButtonText === 'string' && nextButtonText.trim().length > 0
      ? nextButtonText
      : 'Next';

  // ==========================================
  // BUTTON CLASSES
  // ==========================================
  const backButtonClasses = `
    inline-flex items-center gap-2 px-6 py-3
    bg-white border-2 border-gray-300
    text-gray-700 font-medium rounded-lg
    hover:bg-gray-50 hover:border-gray-400
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
  `.trim();

  const nextButtonClasses = `
    inline-flex items-center gap-2 px-6 py-3
    font-medium rounded-lg
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${
      validIsLastStep
        ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 disabled:hover:bg-green-600'
        : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:hover:bg-blue-600'
    }
  `.trim();

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <footer className="border-t border-gray-200 bg-white px-8 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* ==========================================
              LEFT SIDE - Back Button
          ========================================== */}
          <div>
            {validShowBackButton ? (
              <button
                type="button"
                onClick={onBack}
                disabled={validDisabled}
                className={backButtonClasses}
                aria-label="Go to previous step"
              >
                {/* Back arrow icon */}
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back</span>
              </button>
            ) : (
              // Empty div to maintain spacing
              <div></div>
            )}
          </div>

          {/* ==========================================
              RIGHT SIDE - Next/Download Button
          ========================================== */}
          <div>
            <button
              type="button"
              onClick={onNext}
              disabled={validDisabled}
              className={nextButtonClasses}
              aria-label={
                validIsLastStep ? 'Download resume' : 'Go to next step'
              }
            >
              <span>{validNextButtonText}</span>

              {/* Icon based on step type */}
              {validIsLastStep ? (
                // Download icon for last step
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              ) : (
                // Next arrow icon
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
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ==========================================
            DISABLED STATE MESSAGE (Accessibility)
        ========================================== */}
        {validDisabled && (
          <p
            className="text-xs text-gray-500 text-center mt-3"
            role="status"
            aria-live="polite"
          >
            Please wait while we save your changes...
          </p>
        )}
      </div>
    </footer>
  );
}

// ==========================================
// PROP TYPES
// ==========================================
FormFooter.propTypes = {
  showBackButton: PropTypes.bool,
  nextButtonText: PropTypes.string,
  isLastStep: PropTypes.bool,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

FormFooter.defaultProps = {
  showBackButton: false,
  nextButtonText: 'Next',
  isLastStep: false,
  disabled: false,
};

// ==========================================
// MEMOIZATION
// ==========================================
export default memo(FormFooter);
