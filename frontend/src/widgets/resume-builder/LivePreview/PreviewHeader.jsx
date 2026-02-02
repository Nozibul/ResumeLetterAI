/**
 * @file widgets/resume-builder/LivePreview/PreviewHeader.jsx
 * @description Preview header with zoom and control buttons
 * @author Nozibul Islam
 *
 * Features:
 * - Zoom in/out/reset controls
 * - Zoom level display
 * - Template change button
 * - Mobile close button
 * - Responsive layout
 *
 * Performance:
 * - Memoized component
 * - No unnecessary re-renders
 *
 * Accessibility:
 * - ARIA labels for buttons
 * - Keyboard accessible
 * - Screen reader friendly
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * PreviewHeader Component
 * Top control bar for preview area
 */
function PreviewHeader({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onTemplateChange,
  onClose,
}) {
  // ==========================================
  // INPUT VALIDATION
  // ==========================================
  const validZoomLevel =
    typeof zoomLevel === 'number' && zoomLevel >= 50 && zoomLevel <= 150
      ? zoomLevel
      : 100;

  // ==========================================
  // BUTTON BASE CLASSES
  // ==========================================
  const iconButtonClasses = `
    p-2 rounded-lg
    bg-white hover:bg-gray-50 border border-gray-200
    text-gray-700 hover:text-gray-900
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
  `.trim();

  const primaryButtonClasses = `
    inline-flex items-center gap-2 px-4 py-2
    bg-blue-600 hover:bg-blue-700 text-white
    rounded-lg font-medium transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `.trim();

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        {/* ==========================================
            LEFT SIDE - Title + Mobile Close
        ========================================== */}
        <div className="flex items-center gap-3">
          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close preview"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
        </div>

        {/* ==========================================
            RIGHT SIDE - Controls
        ========================================== */}
        <div className="flex items-center gap-4">
          {/* ==========================================
              ZOOM CONTROLS
          ========================================== */}
          <div className="hidden md:flex items-center gap-2">
            {/* Zoom out button */}
            <button
              type="button"
              onClick={onZoomOut}
              disabled={validZoomLevel <= 50}
              className={iconButtonClasses}
              aria-label="Zoom out"
              title="Zoom out"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                />
              </svg>
            </button>

            {/* Zoom level display */}
            <button
              type="button"
              onClick={onZoomReset}
              className="px-3 py-2 min-w-[4rem] text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Current zoom: ${validZoomLevel}%. Click to reset to 100%`}
              title="Click to reset zoom"
            >
              {validZoomLevel}%
            </button>

            {/* Zoom in button */}
            <button
              type="button"
              onClick={onZoomIn}
              disabled={validZoomLevel >= 150}
              className={iconButtonClasses}
              aria-label="Zoom in"
              title="Zoom in"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </button>
          </div>

          {/* ==========================================
              TEMPLATE CHANGE BUTTON
          ========================================== */}
          <button
            type="button"
            onClick={onTemplateChange}
            className={primaryButtonClasses}
            aria-label="Change resume template"
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
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            </svg>
            <span className="hidden sm:inline">Change Template</span>
            <span className="sm:hidden">Template</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// ==========================================
// PROP TYPES
// ==========================================
PreviewHeader.propTypes = {
  zoomLevel: PropTypes.number,
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  onZoomReset: PropTypes.func.isRequired,
  onTemplateChange: PropTypes.func,
  onClose: PropTypes.func,
};

PreviewHeader.defaultProps = {
  zoomLevel: 100,
  onTemplateChange: () => {},
  onClose: () => {},
};

// ==========================================
// MEMOIZATION
// ==========================================
export default memo(PreviewHeader);
