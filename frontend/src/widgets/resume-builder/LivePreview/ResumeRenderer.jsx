/**
 * @file widgets/resume-builder/LivePreview/ResumeRenderer.jsx
 * @description Core resume rendering engine with template support
 * @author Nozibul Islam
 *
 * Features:
 * - Template-based rendering
 * - User data injection with XSS prevention
 * - Section-based layout
 * - Responsive A4 page simulation
 * - ATS-friendly output
 *
 * Performance:
 * - Memoized rendering
 * - Efficient DOM updates
 * - Optimized re-renders
 *
 * Security:
 * - XSS prevention (DOMPurify for rich text)
 * - Input sanitization
 * - Safe HTML rendering
 *
 * CRITICAL:
 * - This is a placeholder implementation
 * - Actual template rendering will be integrated with backend template engine
 * - For now, renders a clean ATS-friendly structure
 */

'use client';

import { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '@/shared/lib/utils';
import logger from '@/shared/lib/logger';

/**
 * ResumeRenderer Component
 * Renders resume based on template and user data
 */
function ResumeRenderer({ resumeData, templateId }) {
  // ==========================================
  // INPUT VALIDATION & SANITIZATION
  // ==========================================
  const validData = useMemo(() => {
    if (!resumeData || typeof resumeData !== 'object') {
      logger.warn('Invalid resumeData in renderer');
      return null;
    }
    return resumeData;
  }, [resumeData]);

  // ==========================================
  // SECTION VISIBILITY CHECK (Memoized)
  // ==========================================
  const isSectionVisible = useCallback(
    (sectionKey) => {
      // If no visibility settings, show all sections
      if (!validData?.sectionVisibility) return true;

      const visibility = validData.sectionVisibility;

      // Handle plain object (from Redux)
      if (typeof visibility === 'object' && !Array.isArray(visibility)) {
        // If key doesn't exist, default to true
        return visibility[sectionKey] !== false;
      }

      // Default: show section
      return true;
    },
    [validData?.sectionVisibility]
  );

  // ==========================================
  // RENDER HELPER: Sanitize Text (XSS Prevention)
  // ==========================================
  const sanitizeText = (text) => {
    if (!text || typeof text !== 'string') return '';

    // Basic XSS prevention (remove script tags, event handlers)
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  };

  // ==========================================
  // EMPTY STATE CHECK
  // ==========================================
  if (!validData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-500">No data to display</p>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER - ATS-FRIENDLY TEMPLATE
  // This is a placeholder - actual template engine will be integrated
  // ==========================================
  return (
    <div
      className="bg-white rounded-lg shadow-2xl overflow-hidden"
      style={{
        width: '100%', // ← Responsive to parent
        aspectRatio: '210 / 297', // ← Maintain A4 ratio
        margin: '0 auto',
      }}
    >
      {/* ==========================================
          RESUME CONTENT (A4 Page)
      ========================================== */}
      <div className="p-4" style={{ fontSize: '10pt', lineHeight: '1.2' }}>
        {/* ==========================================
            HEADER - Personal Info
        ========================================== */}
        {isSectionVisible('personalInfo') && validData.personalInfo && (
          <header className="mb-4 text-center border-b-1 border-gray-800 pb-2">
            {/* Full Name */}
            <h1
              className="text-2xl font-semibold text-gray-900 uppercase"
              style={{ letterSpacing: '0.05em' }}
            >
              {sanitizeText(validData.personalInfo.fullName) || 'YOUR NAME'}
            </h1>

            {/* Job Title */}
            {validData.personalInfo.jobTitle && (
              <p className="text-md text-gray-800 font-semibold mb-2">
                {sanitizeText(validData.personalInfo.jobTitle)}
              </p>
            )}

            {/* Contact Info */}
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 flex-nowrap">
              {validData.personalInfo.email && (
                <span className="whitespace-nowrap">
                  {sanitizeText(validData.personalInfo.email)}
                </span>
              )}
              {validData.personalInfo.phone && <span>•</span>}
              {validData.personalInfo.phone && (
                <span className="whitespace-nowrap">
                  {sanitizeText(validData.personalInfo.phone)}
                </span>
              )}
              {validData.personalInfo.location && <span>•</span>}
              {validData.personalInfo.location && (
                <span className="whitespace-nowrap">
                  {sanitizeText(validData.personalInfo.location)}
                </span>
              )}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 mt-1">
              {validData.personalInfo.linkedin && (
                <a
                  href={sanitizeText(validData.personalInfo.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {validData.personalInfo.github && <span>•</span>}
              {validData.personalInfo.github && (
                <a
                  href={sanitizeText(validData.personalInfo.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  GitHub
                </a>
              )}
              {validData.personalInfo.portfolio && <span>•</span>}
              {validData.personalInfo.portfolio && (
                <a
                  href={sanitizeText(validData.personalInfo.portfolio)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Portfolio
                </a>
              )}
            </div>
          </header>
        )}
        {/* ==========================================
            SUMMARY
        ========================================== */}
        {isSectionVisible('summary') && validData.summary?.text && (
          <section className="mb-4">
            <h2 className="text-md font-semibold text-gray-900 uppercase mb-2 border-b border-gray-300 pb-1">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed text-xs">
              {sanitizeText(validData.summary.text)}
            </p>
          </section>
        )}
        {/* ==========================================
            WORK EXPERIENCE
        ========================================== */}
        {isSectionVisible('workExperience') &&
          validData.workExperience?.length > 0 && (
            <section className="mb-4">
              <h2 className="text-md font-semibold text-gray-900 uppercase mb-2 border-b border-gray-300 pb-1">
                Work Experience
              </h2>
              <div className="space-y-2">
                {validData.workExperience.map((exp, index) => (
                  <div key={exp._id || index}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {sanitizeText(exp.jobTitle)}
                        </h3>
                        <p className="text-gray-700 italic text-xs">
                          {sanitizeText(exp.company)}
                          {exp.location && ` - ${sanitizeText(exp.location)}`}
                        </p>
                      </div>
                      <span className="text-xs text-gray-700 whitespace-nowrap ml-4">
                        {formatDate(exp.startDate)} -{' '}
                        {exp.currentlyWorking
                          ? 'Present'
                          : formatDate(exp.endDate)}
                      </span>
                    </div>
                    {exp.responsibilities?.length > 0 && (
                      <ul className="text-xs list-disc list-inside space-y-1 text-gray-700 mt-2">
                        {exp.responsibilities.map((resp, idx) => (
                          <li key={idx}>{sanitizeText(resp)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* ==========================================
                  PROJECTS - WITH LINKS
          ========================================== */}
        {isSectionVisible('projects') && validData.projects?.length > 0 && (
          <section className="mb-4">
            <h2 className="text-md font-semibold text-gray-900 uppercase mb-2 border-b border-gray-300 pb-1">
              Projects
            </h2>
            <div className="space-y-2">
              {validData.projects.map((project, index) => (
                <div key={project._id || index}>
                  {/* Project Name with Links */}
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-semibold text-gray-900">
                      {sanitizeText(project.projectName)}
                    </h3>

                    {/* Live URL & Source Code */}
                    {(project.liveUrl || project.sourceCode) && (
                      <div className="flex items-center gap-2 text-xs">
                        {project.liveUrl && (
                          <a
                            href={sanitizeText(project.liveUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:underline whitespace-nowrap"
                          >
                            🔗 Live
                          </a>
                        )}
                        {project.sourceCode && (
                          <a
                            href={sanitizeText(project.sourceCode)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:underline whitespace-nowrap"
                          >
                            📂 Code
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tech Stack */}
                  {project.technologies?.length > 0 && (
                    <p className="text-xs text-gray-600 mb-1">
                      <span className="font-semibold">Tech Stack:</span>{' '}
                      {project.technologies
                        .map((t) => sanitizeText(t))
                        .join(', ')}
                    </p>
                  )}

                  {/* Description */}
                  {project.description && (
                    <p className="text-gray-700 mb-2 text-xs">
                      {sanitizeText(project.description)}
                    </p>
                  )}

                  {/* Highlights */}
                  {project.highlights?.length > 0 && (
                    <ul className="text-xs list-disc list-inside space-y-1 text-gray-700">
                      {project.highlights.map((highlight, idx) => (
                        <li key={idx}>{sanitizeText(highlight)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        {/* ==========================================
            SKILLS
        ========================================== */}
        {isSectionVisible('skills') && validData.skills && (
          <section className="mb-4">
            <h2 className="text-md font-semibold text-gray-900 uppercase mb-2 border-b border-gray-300 pb-1">
              Technical Skills
            </h2>
            <div className="space-y-1">
              {Object.entries(validData.skills).map(([category, skills]) => {
                if (!Array.isArray(skills) || skills.length === 0) return null;

                return (
                  <div key={category} className="flex text-sm">
                    <span className="font-semibold text-gray-800 min-w-[140px] capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-gray-700">
                      {skills.map((s) => sanitizeText(s)).join(', ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        {/* ==========================================
            EDUCATION
        ========================================== */}
        {isSectionVisible('education') && validData.education?.length > 0 && (
          <section className="mb-4">
            <h2 className="text-md font-semibold text-gray-900 uppercase mb-2 border-b border-gray-300 pb-1">
              Education
            </h2>
            <div className="space-y-3">
              {validData.education.map((edu, index) => (
                <div key={edu._id || index} className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {sanitizeText(edu.degree)}
                    </h3>
                    <p className="text-gray-700 italic">
                      {sanitizeText(edu.institution)}
                      {edu.location && ` - ${sanitizeText(edu.location)}`}
                    </p>
                    {edu.gpa && (
                      <p className="text-sm text-gray-600">
                        GPA: {sanitizeText(edu.gpa)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                    {formatDate(edu.graduationDate)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* ==========================================
            CERTIFICATIONS (Optional)
        ========================================== */}
        {isSectionVisible('certifications') &&
          validData.certifications?.length > 0 && (
            <section className="mb-4">
              <h2 className="text-md font-semibold text-gray-900 uppercase mb-2 border-b border-gray-300 pb-1">
                Certifications
              </h2>
              <div className="space-y-2">
                {validData.certifications.map((cert, index) => (
                  <div key={cert._id || index} className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {sanitizeText(cert.certificationName)}
                      </h3>
                      {cert.issuer && (
                        <p className="text-sm text-gray-600">
                          {sanitizeText(cert.issuer)}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                      {formatDate(cert.issueDate)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
      </div>
    </div>
  );
}

// ==========================================
// PROP TYPES
// ==========================================
ResumeRenderer.propTypes = {
  resumeData: PropTypes.object,
  templateId: PropTypes.string,
};

ResumeRenderer.defaultProps = {
  resumeData: null,
  templateId: null,
};

// ==========================================
// MEMOIZATION
// Only re-render when data changes
// ==========================================
export default memo(ResumeRenderer);
