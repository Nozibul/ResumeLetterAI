/**
 * @file widgets/resume-builder/LivePreview/PreviewFooter.jsx
 * @description Preview footer with download options and stats
 * @author Nozibul Islam
 *
 * Features:
 * - Download button (PDF/DOCX)
 * - Resume completion stats
 * - Section count display
 * - Responsive layout
 *
 * Performance:
 * - Memoized component
 * - Memoized stats calculation
 *
 * Accessibility:
 * - ARIA labels
 * - Semantic HTML
 */

'use client';

import { memo, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import logger from '@/shared/lib/logger';

/**
 * PreviewFooter Component
 * Bottom action bar with download and stats
 */
function PreviewFooter({ resumeData, templateId }) {
  // ==========================================
  // STATS CALCULATION (Memoized)
  // ==========================================
  const stats = useMemo(() => {
    if (!resumeData) {
      return {
        totalSections: 0,
        visibleSections: 0,
        workCount: 0,
        projectCount: 0,
        educationCount: 0,
      };
    }

    // Count visible sections
    let visibleCount = 0;
    const sectionVisibility = resumeData.sectionVisibility;

    if (sectionVisibility) {
      // If sectionVisibility is a Map
      if (sectionVisibility instanceof Map) {
        sectionVisibility.forEach((visible) => {
          if (visible) visibleCount++;
        });
      }
      // If sectionVisibility is an object
      else if (typeof sectionVisibility === 'object') {
        visibleCount = Object.values(sectionVisibility).filter(Boolean).length;
      }
    } else {
      // Default: count filled sections
      if (resumeData.personalInfo) visibleCount++;
      if (resumeData.summary?.text) visibleCount++;
      if (resumeData.workExperience?.length > 0) visibleCount++;
      if (resumeData.projects?.length > 0) visibleCount++;
      if (resumeData.skills) visibleCount++;
      if (resumeData.education?.length > 0) visibleCount++;
    }

    return {
      totalSections: 10, // Max sections
      visibleSections: visibleCount,
      workCount: resumeData.workExperience?.length || 0,
      projectCount: resumeData.projects?.length || 0,
      educationCount: resumeData.education?.length || 0,
    };
  }, [resumeData]);

  // ==========================================
  // DOWNLOAD HANDLER (Memoized)
  // ==========================================
  const handleDownload = useCallback(
    async (format = 'pdf') => {
      try {
        logger.info(`Download initiated: ${format.toUpperCase()}`);

        // Validate data
        if (!resumeData || !templateId) {
          logger.error('Missing resume data or template ID');
          alert('Cannot download: Resume data is incomplete');
          return;
        }

        // TODO: Implement actual download logic
        // This will call API endpoint to generate PDF/DOCX
        // const response = await downloadResumeAPI(resumeData, templateId, format);

        // Placeholder alert
        alert(
          `Download ${format.toUpperCase()} feature will be implemented with API integration`
        );
      } catch (error) {
        logger.error('Download error:', error);
        alert('Download failed. Please try again.');
      }
    },
    [resumeData, templateId]
  );

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* ==========================================
            LEFT SIDE - Stats
        ========================================== */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {/* Visible sections */}
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span>
              {stats.visibleSections} of {stats.totalSections} sections
            </span>
          </div>

          {/* Item counts */}
          <span className="text-gray-400">•</span>
          <span>
            {stats.workCount} jobs, {stats.projectCount} projects,{' '}
            {stats.educationCount} degrees
          </span>
        </div>

        {/* ==========================================
            RIGHT SIDE - Download Buttons
        ========================================== */}
        <div className="flex items-center gap-2">
          {/* Download PDF button */}
          <button
            type="button"
            onClick={() => handleDownload('pdf')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Download resume as PDF"
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              />
            </svg>
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>

          {/* Download DOCX button (optional) */}
          <button
            type="button"
            onClick={() => handleDownload('docx')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Download resume as DOCX"
            title="Download as Word document"
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="hidden sm:inline">DOCX</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

// ==========================================
// PROP TYPES
// ==========================================
PreviewFooter.propTypes = {
  resumeData: PropTypes.object,
  templateId: PropTypes.string,
};

PreviewFooter.defaultProps = {
  resumeData: null,
  templateId: null,
};

// ==========================================
// MEMOIZATION
// ==========================================
export default memo(PreviewFooter);
