/**
 * @file widgets/resume-builder/LivePreview/index.jsx
 * @description Live resume preview with real-time updates
 * @author Nozibul Islam
 *
 * Features:
 * - Real-time resume preview
 * - Template rendering with user data
 * - Zoom controls (optional)
 * - Template switch button
 * - Mobile close button
 * - Responsive layout
 *
 * Performance:
 * - Memoized rendering
 * - Debounced updates (handled by parent)
 * - Optimized re-renders
 *
 * Security:
 * - XSS prevention in resume renderer
 * - Sanitized user input display
 */

'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import PreviewHeader from './PreviewHeader';
import ResumeRenderer from './ResumeRenderer';
import PreviewFooter from './PreviewFooter';
import logger from '@/shared/lib/logger';

/**
 * LivePreview Component
 * Right sidebar with live resume preview
 */
function LivePreview({ resumeData, templateId, onClose, onTemplateChange }) {
  // ==========================================
  // LOCAL STATE
  // ==========================================
  const [zoomLevel, setZoomLevel] = useState(100);

  // ==========================================
  // INPUT VALIDATION
  // ==========================================
  const validResumeData = useMemo(() => {
    // Ensure resumeData is an object
    if (!resumeData || typeof resumeData !== 'object') {
      logger.warn('Invalid resumeData:', resumeData);
      return null;
    }
    return resumeData;
  }, [resumeData]);

  const validTemplateId = useMemo(() => {
    // Validate MongoDB ObjectId format (24 hex chars)
    if (
      typeof templateId === 'string' &&
      /^[0-9a-fA-F]{24}$/.test(templateId)
    ) {
      return templateId;
    }
    logger.warn('Invalid templateId:', templateId);
    return null;
  }, [templateId]);

  // ==========================================
  // ZOOM HANDLERS (Memoized)
  // ==========================================
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoom = Math.min(prev + 10, 150); // Max 150%
      logger.info('Zoom in:', newZoom);
      return newZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 10, 50); // Min 50%
      logger.info('Zoom out:', newZoom);
      return newZoom;
    });
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(100);
    logger.info('Zoom reset: 100%');
  }, []);

  // ==========================================
  // TEMPLATE CHANGE HANDLER (Memoized)
  // ==========================================
  const handleTemplateChange = useCallback(() => {
    if (typeof onTemplateChange === 'function') {
      onTemplateChange();
    } else {
      logger.warn('onTemplateChange is not a function');
    }
  }, [onTemplateChange]);

  // ==========================================
  // CLOSE HANDLER (Memoized)
  // ==========================================
  const handleClose = useCallback(() => {
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);

  // ==========================================
  // EMPTY STATE CHECK
  // ==========================================
  const isEmpty = useMemo(() => {
    return !validResumeData || !validTemplateId;
  }, [validResumeData, validTemplateId]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* ==========================================
          PREVIEW HEADER
      ========================================== */}
      <PreviewHeader
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onTemplateChange={handleTemplateChange}
        onClose={handleClose}
      />

      {/* ==========================================
          PREVIEW CONTENT (Scrollable)
      ========================================== */}
      <div className="flex-1 overflow-y-auto p-8">
        {isEmpty ? (
          // Empty state
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <svg
                className="mx-auto h-24 w-24 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Preview Available
              </h3>
              <p className="text-sm text-gray-600">
                Start filling out the form to see your resume preview here.
              </p>
            </div>
          </div>
        ) : (
          // Resume preview with zoom
          <div
            className="transition-transform duration-300 origin-top"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <ResumeRenderer
              resumeData={validResumeData}
              templateId={validTemplateId}
            />
          </div>
        )}
      </div>

      {/* ==========================================
          PREVIEW FOOTER (Optional - Download button, etc.)
      ========================================== */}
      {!isEmpty && (
        <PreviewFooter
          resumeData={validResumeData}
          templateId={validTemplateId}
        />
      )}
    </div>
  );
}

// ==========================================
// PROP TYPES
// ==========================================
LivePreview.propTypes = {
  resumeData: PropTypes.object,
  templateId: PropTypes.string,
  onClose: PropTypes.func,
  onTemplateChange: PropTypes.func,
};

LivePreview.defaultProps = {
  resumeData: null,
  templateId: null,
  onClose: () => {},
  onTemplateChange: () => {},
};

// ==========================================
// MEMOIZATION
// Only re-render when props actually change
// ==========================================
export default memo(LivePreview);
