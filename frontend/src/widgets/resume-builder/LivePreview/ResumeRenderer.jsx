/**
 * @file widgets/resume-builder/LivePreview/ResumeRenderer.jsx
 * @description Resume renderer with DYNAMIC FONT SCALING
 * @author Nozibul Islam
 *
 * ✅ Projects section now shows correctly in preview
 * ✅ Competitive Programming (CP) section added back
 * ✅ memo() re-render issue fixed with JSON.stringify key
 * ✅ Empty project guard added (skips projects with no name)
 */

'use client';

import { memo, useCallback, useMemo } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { formatDate } from '@/shared/lib/utils';
import {
  useAutoFontSize,
  getFontSizeLabel,
} from '@/shared/hooks/useAutoFontSize';
import logger from '@/shared/lib/logger';

function ResumeRenderer({ resumeData, templateId }) {
  // ==========================================
  // DYNAMIC FONT SCALING
  // ==========================================
  const { fontSize, containerRef, isScaling } = useAutoFontSize(
    resumeData,
    1123,
    8,
    11
  );

  // ==========================================
  // INPUT VALIDATION
  // ==========================================
  const validData = useMemo(() => {
    if (!resumeData || typeof resumeData !== 'object') {
      logger.warn('Invalid resumeData in renderer');
      return null;
    }
    return resumeData;
  }, [resumeData]);

  // ==========================================
  // SECTION VISIBILITY CHECK
  // ==========================================
  const isSectionVisible = useCallback(
    (sectionKey) => {
      if (!validData?.sectionVisibility) return true;
      const visibility = validData.sectionVisibility;
      if (typeof visibility === 'object' && !Array.isArray(visibility)) {
        return visibility[sectionKey] !== false;
      }
      return true;
    },
    [validData?.sectionVisibility]
  );

  // ==========================================
  // SANITIZE TEXT (XSS Prevention)
  // ==========================================
  const sanitizeText = useCallback((text) => {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  }, []);

  // ==========================================
  // EMPTY STATE
  // ==========================================
  if (!validData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-500">No data to display</p>
      </div>
    );
  }

  // ==========================================
  // DYNAMIC SPACING
  // ==========================================
  const spacing = useMemo(() => {
    if (fontSize >= 10.5) {
      return {
        padding: 'p-6',
        sectionGap: 'mb-3',
        listGap: 'space-y-1',
        lineHeight: '1.3',
      };
    } else if (fontSize >= 9) {
      return {
        padding: 'p-4',
        sectionGap: 'mb-2',
        listGap: 'space-y-0.5',
        lineHeight: '1.2',
      };
    } else {
      return {
        padding: 'p-2',
        sectionGap: 'mb-2',
        listGap: 'space-y-0',
        lineHeight: '1.1',
      };
    }
  }, [fontSize]);

  // ==========================================
  // FILTER EMPTY ENTRIES
  // ==========================================
  const validProjects = useMemo(() => {
    if (!Array.isArray(validData.projects)) return [];
    return validData.projects.filter(
      (p) =>
        p && typeof p.projectName === 'string' && p.projectName.trim() !== ''
    );
  }, [validData.projects]);

  const validCPProfiles = useMemo(() => {
    if (!Array.isArray(validData.competitiveProgramming)) return [];
    return validData.competitiveProgramming.filter(
      (cp) => cp && cp.platform?.trim()
    );
  }, [validData.competitiveProgramming]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="relative">
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-teal-500 text-white text-xs px-2 py-1 rounded z-10">
          {fontSize}pt ({getFontSizeLabel(fontSize)})
        </div>
      )}
      {isScaling && (
        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded z-10 animate-pulse">
          Optimizing...
        </div>
      )}

      <div
        className="bg-white rounded-lg shadow-2xl"
        style={{ width: '100%', aspectRatio: '210 / 297', margin: '0 auto' }}
      >
        <div
          ref={containerRef}
          className={spacing.padding}
          style={{ fontSize: `${fontSize}pt`, lineHeight: spacing.lineHeight }}
        >
          {/* ========== HEADER ========== */}
          {isSectionVisible('personalInfo') && validData.personalInfo && (
            <header
              className={`${spacing.sectionGap} text-center border-b border-gray-800 pb-2`}
            >
              <h1
                className="text-2xl font-semibold text-gray-900 uppercase"
                style={{ letterSpacing: '0.05em' }}
              >
                {sanitizeText(validData.personalInfo.fullName) || 'YOUR NAME'}
              </h1>

              {validData.personalInfo.jobTitle && (
                <p className="text-sm text-gray-800 font-semibold mb-1">
                  {sanitizeText(validData.personalInfo.jobTitle)}
                </p>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-gray-600 flex-wrap">
                {validData.personalInfo.email && (
                  <span>{sanitizeText(validData.personalInfo.email)}</span>
                )}
                {validData.personalInfo.phone && <span>•</span>}
                {validData.personalInfo.phone && (
                  <span>{sanitizeText(validData.personalInfo.phone)}</span>
                )}
                {validData.personalInfo.location && <span>•</span>}
                {validData.personalInfo.location && (
                  <span>{sanitizeText(validData.personalInfo.location)}</span>
                )}
              </div>

              {(validData.personalInfo.linkedin ||
                validData.personalInfo.github ||
                validData.personalInfo.portfolio) && (
                <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-600 mt-1">
                  {validData.personalInfo.linkedin && (
                    <Link
                      href={sanitizeText(validData.personalInfo.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      LinkedIn
                    </Link>
                  )}
                  {validData.personalInfo.linkedin &&
                    validData.personalInfo.github && <span>•</span>}
                  {validData.personalInfo.github && (
                    <Link
                      href={sanitizeText(validData.personalInfo.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      GitHub
                    </Link>
                  )}
                  {validData.personalInfo.portfolio &&
                    (validData.personalInfo.linkedin ||
                      validData.personalInfo.github) && <span>•</span>}
                  {validData.personalInfo.portfolio && (
                    <Link
                      href={sanitizeText(validData.personalInfo.portfolio)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Portfolio
                    </Link>
                  )}
                </div>
              )}
            </header>
          )}

          {/* ========== SUMMARY ========== */}
          {isSectionVisible('summary') && validData.summary?.text && (
            <section className={spacing.sectionGap}>
              <h2 className="text-xs font-semibold text-gray-900 uppercase mb-1 border-b border-gray-300 pb-1 tracking-wide">
                Professional Summary
              </h2>
              <p className="text-xs text-gray-700 leading-relaxed">
                {sanitizeText(validData.summary.text)}
              </p>
            </section>
          )}

          {/* ========== WORK EXPERIENCE ========== */}
          {isSectionVisible('workExperience') &&
            validData.workExperience?.length > 0 && (
              <section className={spacing.sectionGap}>
                <h2 className="text-xs font-semibold text-gray-900 uppercase mb-1 border-b border-gray-300 pb-1 tracking-wide">
                  Work Experience
                </h2>
                <div className={spacing.listGap}>
                  {validData.workExperience.map((exp, index) => (
                    <div key={exp._id || index}>
                      <div className="flex justify-between items-start mb-0.5">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-xs">
                            {sanitizeText(exp.jobTitle)}
                          </h3>
                          <p className="text-gray-600 italic text-xs">
                            {sanitizeText(exp.company)}
                            {exp.location && ` — ${sanitizeText(exp.location)}`}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {formatDate(exp.startDate)} –{' '}
                          {exp.currentlyWorking
                            ? 'Present'
                            : formatDate(exp.endDate)}
                        </span>
                      </div>
                      {exp.responsibilities?.length > 0 && (
                        <ul className="list-disc list-inside space-y-0.5 text-gray-700 mt-0.5">
                          {exp.responsibilities.map((resp, idx) => (
                            <li key={idx} className="text-xs">
                              {sanitizeText(resp)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* ========== PROJECTS ========== */}
          {isSectionVisible('projects') && validProjects.length > 0 && (
            <section className={spacing.sectionGap}>
              <h2 className="text-xs font-semibold text-gray-900 uppercase mb-1 border-b border-gray-300 pb-1 tracking-wide">
                Projects
              </h2>
              <div className={spacing.listGap}>
                {validProjects.map((project, index) => (
                  <div key={project._id || index}>
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-semibold text-gray-900 text-xs">
                        {sanitizeText(project.projectName)}
                      </h3>
                      <div className="flex items-center gap-2 text-xs">
                        {project.liveUrl && (
                          <Link
                            href={sanitizeText(project.liveUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:underline"
                          >
                            🔗 Live
                          </Link>
                        )}
                        {project.sourceCode && (
                          <Link
                            href={sanitizeText(project.sourceCode)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:underline"
                          >
                            📂 Code
                          </Link>
                        )}
                      </div>
                    </div>
                    {project.technologies?.length > 0 && (
                      <p className="text-xs text-gray-600 mb-0.5">
                        <span className="font-semibold">Tech Stack:</span>{' '}
                        {project.technologies
                          .map((t) => sanitizeText(t))
                          .join(', ')}
                      </p>
                    )}
                    {project.description && (
                      <p className="text-xs text-gray-700 mb-0.5">
                        {sanitizeText(project.description)}
                      </p>
                    )}
                    {project.highlights?.some((h) => h.trim()) && (
                      <ul className="list-disc list-inside space-y-0.5 text-gray-700">
                        {project.highlights
                          .filter((h) => h.trim())
                          .map((highlight, idx) => (
                            <li key={idx} className="text-xs">
                              {sanitizeText(highlight)}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ========== SKILLS ========== */}
          {isSectionVisible('skills') &&
            validData.skills &&
            Object.values(validData.skills).some(
              (v) => Array.isArray(v) && v.length > 0
            ) && (
              <section className={spacing.sectionGap}>
                <h2 className="text-xs font-semibold text-gray-900 uppercase mb-1 border-b border-gray-300 pb-1 tracking-wide">
                  Technical Skills
                </h2>
                <div className="space-y-0.5">
                  {Object.entries(validData.skills).map(
                    ([category, skills]) => {
                      if (!Array.isArray(skills) || skills.length === 0)
                        return null;
                      return (
                        <div key={category} className="flex gap-1 text-xs">
                          <span className="font-semibold text-gray-800 shrink-0 capitalize">
                            {category.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-gray-700">
                            {skills.map((s) => sanitizeText(s)).join(', ')}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            )}

          {/* ========== EDUCATION ========== */}
          {isSectionVisible('education') && validData.education?.length > 0 && (
            <section className={spacing.sectionGap}>
              <h2 className="text-xs font-semibold text-gray-900 uppercase mb-1 border-b border-gray-300 pb-1 tracking-wide">
                Education
              </h2>
              <div className={spacing.listGap}>
                {validData.education.map((edu, index) => (
                  <div key={edu._id || index} className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-xs">
                        {sanitizeText(edu.degree)}
                      </h3>
                      <p className="text-gray-600 italic text-xs">
                        {sanitizeText(edu.institution)}
                        {edu.location && ` — ${sanitizeText(edu.location)}`}
                      </p>
                      {edu.gpa && (
                        <p className="text-xs text-gray-500">
                          GPA: {sanitizeText(edu.gpa)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {formatDate(edu.graduationDate)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ========== COMPETITIVE PROGRAMMING ========== */}
          {isSectionVisible('competitiveProgramming') &&
            validCPProfiles.length > 0 && (
              <section className={spacing.sectionGap}>
                <h2 className="text-xs font-semibold text-gray-900 uppercase mb-1 border-b border-gray-300 pb-1 tracking-wide">
                  Competitive Programming
                </h2>
                <div className={spacing.listGap}>
                  {validCPProfiles.map((cp, index) => (
                    <div
                      key={cp._id || index}
                      className="flex justify-between items-start"
                    >
                      <div>
                        {/* Platform name + View Profile পাশাপাশি */}
                        <h3 className="font-semibold text-gray-900 text-xs flex items-center gap-2">
                          {sanitizeText(cp.platform)}
                          {cp.profileUrl && (
                            <Link
                              href={sanitizeText(cp.profileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal-600 hover:underline font-normal"
                            >
                              View Profile
                            </Link>
                          )}
                        </h3>

                        {/* Badges */}
                        {cp.badges?.length > 0 && (
                          <p className="text-xs text-gray-600">
                            <span className="font-semibold">Badges:</span>{' '}
                            {cp.badges.map((b) => sanitizeText(b)).join(', ')}
                          </p>
                        )}
                      </div>

                      {/* Problems Solved */}
                      {cp.problemsSolved > 0 && (
                        <p className="text-xs text-gray-600 text-right">
                          Solved:{' '}
                          <span className="font-semibold text-gray-800">
                            {cp.problemsSolved}
                          </span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* ========== CERTIFICATIONS ========== */}
          {isSectionVisible('certifications') &&
            validData.certifications?.length > 0 && (
              <section className={spacing.sectionGap}>
                <h2 className="text-xs font-semibold text-gray-900 uppercase mb-1 border-b border-gray-300 pb-1 tracking-wide">
                  Certifications
                </h2>
                <div className={spacing.listGap}>
                  {validData.certifications.map((cert, index) => (
                    <div
                      key={cert._id || index}
                      className="flex justify-between"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900 text-xs">
                          {sanitizeText(cert.certificationName)}
                        </h3>
                        {cert.issuer && (
                          <p className="text-xs text-gray-500">
                            {sanitizeText(cert.issuer)}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(cert.issueDate)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
        </div>
      </div>
    </div>
  );
}

ResumeRenderer.propTypes = {
  resumeData: PropTypes.object,
  templateId: PropTypes.string,
};

ResumeRenderer.defaultProps = {
  resumeData: null,
  templateId: null,
};

export default memo(ResumeRenderer);
