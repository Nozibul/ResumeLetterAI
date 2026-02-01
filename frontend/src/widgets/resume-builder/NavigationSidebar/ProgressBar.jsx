/**
 * @file widgets/resume-builder/NavigationSidebar/ProgressBar.jsx
 * @description Resume completion progress indicator
 * @author Nozibul Islam
 *
 * Features:
 * - Animated progress bar (0-100%)
 * - Percentage label
 * - Color gradient based on progress
 * - Smooth transitions
 * - Accessible (ARIA attributes)
 *
 * Performance:
 * - CSS-only animations (GPU accelerated)
 * - Memoized to prevent unnecessary re-renders
 *
 * Accessibility:
 * - ARIA role="progressbar"
 * - aria-valuenow, aria-valuemin, aria-valuemax
 * - Screen reader announcements
 */

'use client';

import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * ProgressBar Component
 * Shows resume completion percentage
 */
function ProgressBar({ progress }) {
  // ==========================================
  // INPUT VALIDATION & SANITIZATION
  // ==========================================
  const validProgress = useMemo(() => {
    // Ensure number type
    if (typeof progress !== 'number') {
      return 0;
    }

    // Clamp between 0-100
    if (progress < 0) return 0;
    if (progress > 100) return 100;

    // Round to avoid decimals
    return Math.round(progress);
  }, [progress]);

  // ==========================================
  // PROGRESS COLOR (Memoized)
  // Green when complete, blue otherwise
  // ==========================================
  const progressColor = useMemo(() => {
    if (validProgress === 100) {
      return 'bg-green-500';
    } else if (validProgress >= 75) {
      return 'bg-blue-500';
    } else if (validProgress >= 50) {
      return 'bg-blue-400';
    } else if (validProgress >= 25) {
      return 'bg-blue-300';
    } else {
      return 'bg-gray-400';
    }
  }, [validProgress]);

  // ==========================================
  // ACCESSIBILITY LABEL
  // ==========================================
  const ariaLabel = useMemo(() => {
    if (validProgress === 0) {
      return 'Resume not started';
    } else if (validProgress === 100) {
      return 'Resume complete';
    } else {
      return `Resume ${validProgress}% complete`;
    }
  }, [validProgress]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-2">
      {/* ==========================================
          LABEL
      ========================================== */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">Resume Completeness:</span>
        <span
          className={`font-bold ${
            validProgress === 100 ? 'text-green-600' : 'text-blue-600'
          }`}
          aria-live="polite"
        >
          {validProgress}%
        </span>
      </div>

      {/* ==========================================
          PROGRESS BAR
      ========================================== */}
      <div
        className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={validProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        {/* Progress fill with smooth transition */}
        <div
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${progressColor}
          `}
          style={{ width: `${validProgress}%` }}
        />

        {/* Animated shimmer effect (using Tailwind config) */}
        {validProgress > 0 && validProgress < 100 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
        )}
      </div>

      {/* ==========================================
          COMPLETION MESSAGE
      ========================================== */}
      {validProgress === 100 && (
        <p
          className="text-xs text-green-600 font-medium animate-fadeInUp"
          role="status"
          aria-live="polite"
        >
          ✓ All required sections completed!
        </p>
      )}
    </div>
  );
}

// ==========================================
// PROP TYPES
// ==========================================
ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
};

ProgressBar.defaultProps = {
  progress: 0,
};

// ==========================================
// MEMOIZATION
// Only re-render when progress changes
// ==========================================
export default memo(ProgressBar);
