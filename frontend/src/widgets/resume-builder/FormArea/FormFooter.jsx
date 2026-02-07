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
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';
import Button from '@/shared/components/atoms/buttons/Button';

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
  // ICONS
  // ==========================================
  const BackIcon = (
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
  );

  const NextIcon = (
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
  );

  const DownloadIcon = (
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
  );

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <footer className="border-t border-gray-200 bg-white px-8 py-4">
      <div className="max-w-3xl mx-auto mt-2 mb-6">
        <div className="flex items-center justify-between gap-4">
          {/* ==========================================
              LEFT SIDE - Back Button
          ========================================== */}
          <div>
            {validShowBackButton ? (
              <Button
                variant="secondary"
                size="md"
                onClick={onBack}
                disabled={validDisabled}
                icon={BackIcon}
                iconPosition="left"
                aria-label="Go to previous step"
              >
                Back
              </Button>
            ) : (
              <div></div>
            )}
          </div>

          {/* ==========================================
              RIGHT SIDE - Next/Download Button
          ========================================== */}
          <div>
            <Button
              variant="primary"
              size="md"
              onClick={onNext}
              disabled={validDisabled}
              icon={validIsLastStep ? DownloadIcon : NextIcon}
              iconPosition="right"
              aria-label={
                validIsLastStep ? 'Download resume' : 'Go to next step'
              }
            >
              {validNextButtonText}
            </Button>
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
