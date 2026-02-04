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
          <div className="flex items-center justify-center h-full px-8">
            <div className="text-center max-w-md">
              {/* Animated icon */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-gradient-to-br from-teal-400 to-teal-600 rounded-full p-6">
                  <svg
                    className="h-16 w-16 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Your Resume Preview Will Appear Here
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Start filling out the form on the left to see a live preview of
                your professional resume.
              </p>

              {/* Progress indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-teal-600">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
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
