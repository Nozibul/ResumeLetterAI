/**
 * @file widgets/resume-builder/LivePreview/LivePreviewContainer.jsx
 * @description Redux-connected LivePreview wrapper
 * @author Nozibul Islam
 *
 * Architecture:
 * - Connects LivePreview to Redux store
 * - Fetches currentResumeData automatically
 * - Handles template selection
 *
 * Usage:
 * import LivePreviewContainer from '@/widgets/resume-builder/LivePreview/LivePreviewContainer';
 * <LivePreviewContainer isMobile={false} onClose={() => {}} />
 */

'use client';

import { memo } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import LivePreview from './index';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import logger from '@/shared/lib/logger';

/**
 * LivePreviewContainer Component
 * Connects LivePreview to Redux
 */
function LivePreviewContainer({ isMobile, onClose }) {
  // ==========================================
  // REDUX STATE
  // ==========================================

  // Get current resume data from Redux
  const resumeData = useCurrentResumeData();

  // Get template ID (from URL params or Redux)
  // For now, using a default template ID
  // TODO: Get this from URL query params or Redux state
  const templateId = useSelector((state) => {
    // Try to get from currentResumeData first
    if (state.resume.currentResumeData?.templateId) {
      return state.resume.currentResumeData.templateId;
    }
    // Fallback: default template (you'll replace this with actual logic)
    return '696f963d6f9aa4d2edc55ef4'; // Example MongoDB ObjectId
  });

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleTemplateChange = () => {
    logger.info('Template change requested');
    // This will navigate to template selection page
    // Implementation in PreviewHeader component
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <LivePreview
      resumeData={resumeData}
      templateId={templateId}
      isMobile={isMobile}
      onClose={onClose}
      onTemplateChange={handleTemplateChange}
    />
  );
}

LivePreviewContainer.propTypes = {
  isMobile: PropTypes.bool,
  onClose: PropTypes.func,
};

LivePreviewContainer.defaultProps = {
  isMobile: false,
  onClose: () => {},
};

export default memo(LivePreviewContainer);
