/**
 * @file widgets/resume-builder/NavigationSidebar/index.jsx
 * @description Step-based navigation sidebar with progress tracking
 * @author Nozibul Islam
 *
 * Features:
 * - 9-step navigation (Personal Info → Finalize)
 * - Visual progress indicator
 * - Completed steps tracking (checkmarks)
 */

'use client';

import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import StepItem from './StepItem';
import ProgressBar from './ProgressBar';
import { FORM_STEPS } from '@/shared/lib/constants';
import logger from '@/shared/lib/logger';

/**
 * NavigationSidebar Component
 * Left sidebar with step navigation and progress
 */
function NavigationSidebar({
  currentStep,
  completedSteps = [],
  progress = 0,
  onStepClick,
}) {
  // ==========================================
  // INPUT VALIDATION (Security & Bug Prevention)
  // ==========================================

  // Validate currentStep
  const validCurrentStep =
    typeof currentStep === 'number' && currentStep >= 1 && currentStep <= 9
      ? currentStep
      : 1;

  // Validate completedSteps (ensure array)
  const validCompletedSteps = Array.isArray(completedSteps)
    ? completedSteps.filter(
        (step) => typeof step === 'number' && step >= 1 && step <= 9
      )
    : [];

  // Validate progress (0-100)
  const validProgress =
    typeof progress === 'number' && progress >= 0 && progress <= 100
      ? progress
      : 0;

  // ==========================================
  // STEP CLICK HANDLER (Memoized)
  // ==========================================
  const handleStepClick = useCallback(
    (stepId) => {
      // Validate before callback
      if (typeof stepId !== 'number' || stepId < 1 || stepId > 9) {
        logger.warn('Invalid step click:', stepId);
        return;
      }

      // Call parent callback
      if (typeof onStepClick === 'function') {
        onStepClick(stepId);
      }
    },
    [onStepClick]
  );

  // ==========================================
  // KEYBOARD NAVIGATION
  // ==========================================
  const handleKeyDown = useCallback(
    (e, stepId) => {
      // Enter or Space to activate
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStepClick(stepId);
      }
    },
    [handleStepClick]
  );

  return (
    <nav
      className="w-68 bg-white border-r border-gray-200 h-screen flex flex-col"
      aria-label="Resume builder steps navigation"
    >
      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="pl-6 pr-4 py-4 border-b border-gray-200">
        <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-gray-800 to-teal-300 bg-clip-text text-transparent">
          ResumeLetterAI
        </span>{' '}
        <p className="text-sm text-gray-600 mt-1">
          Complete your resume in steps
        </p>
      </div>

      {/* ==========================================
          STEPS LIST
      ========================================== */}
      <div className="custom-scrollbar bg-gradient-to-br from-teal-50 via-white to-teal-100 rounded-lg p-8 lg:col-span-1 flex-1 overflow-y-auto py-4 px-6">
        <ol className="space-y-3 r">
          {FORM_STEPS.map((step) => (
            <StepItem
              key={step.id}
              stepNumber={step.id}
              label={step.label}
              isActive={validCurrentStep === step.id}
              isCompleted={validCompletedSteps.includes(step.id)}
              onClick={() => handleStepClick(step.id)}
              onKeyDown={(e) => handleKeyDown(e, step.id)}
            />
          ))}
        </ol>
      </div>

      {/* ==========================================
          PROGRESS BAR (Bottom)
      ========================================== */}
      <div className="p-6 border-t border-gray-200">
        <ProgressBar progress={validProgress} />
      </div>
    </nav>
  );
}

// ==========================================
// PROP TYPES (Type Safety)
// ==========================================
NavigationSidebar.propTypes = {
  currentStep: PropTypes.number.isRequired,
  completedSteps: PropTypes.arrayOf(PropTypes.number),
  progress: PropTypes.number,
  onStepClick: PropTypes.func.isRequired,
};

NavigationSidebar.defaultProps = {
  completedSteps: [],
  progress: 0,
};

// ==========================================
// MEMOIZATION (Performance)
// Only re-render if props actually change
// ==========================================
export default memo(NavigationSidebar);
