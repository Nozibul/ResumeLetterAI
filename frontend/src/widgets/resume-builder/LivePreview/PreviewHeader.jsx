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
 */

'use client';

import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import Button from '@/shared/components/atoms/buttons/Button';

/**
 * PreviewHeader Component
 * Top control bar for preview area
 */
function PreviewHeader({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onClose,
}) {
  const router = useRouter();
  /**
   * Navigate to template selection page
   * Uses useCallback to prevent unnecessary re-renders
   */
  const handleTemplateChange = useCallback(() => {
    router.push('/resume-templates');
  }, [router]);

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
    bg-white hover:bg-teal-100 border border-gray-200
    text-gray-700 hover:text-teal-600
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
  `.trim();

  return (
    <header className="border-b border-gray-200 bg-white px-3 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* LEFT - Title + Close */}
        <div className="flex items-center gap-2">
          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors duration-200"
            aria-label="Close preview"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Title with icon */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
            <h3 className="text-sm font-semibold text-gray-900">
              Live Preview
            </h3>
          </div>
        </div>

        {/* RIGHT - Controls */}
        <div className="flex items-center gap-2">
          {/* ZOOM CONTROLS */}
          <div className="hidden md:flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            {/* Zoom out */}
            <button
              type="button"
              onClick={onZoomOut}
              disabled={validZoomLevel <= 50}
              className={iconButtonClasses}
              aria-label="Zoom out"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                />
              </svg>
            </button>

            {/* Zoom display */}
            <button
              type="button"
              onClick={onZoomReset}
              className="px-2 py-2 min-w-[3rem] text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-teal-50 hover:text-teal-600 hover:border-teal-300 transition-all duration-200"
            >
              {validZoomLevel}%
            </button>

            {/* Zoom in */}
            <button
              type="button"
              onClick={onZoomIn}
              disabled={validZoomLevel >= 150}
              className={iconButtonClasses}
              aria-label="Zoom in"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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

          {/* TEMPLATE CHANGE */}
          <Button
            onClick={handleTemplateChange}
            variant="secondary"
            size="sm"
            // className="text-[14px] px-2 py-2"
          >
            Change Template
          </Button>
        </div>
      </div>
    </header>
  );
}

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

export default memo(PreviewHeader);
