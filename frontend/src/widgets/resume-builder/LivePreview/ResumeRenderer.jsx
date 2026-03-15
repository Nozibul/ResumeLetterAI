/**
 * @file widgets/resume-builder/LivePreview/ResumeRenderer.jsx
 * @description Resume renderer with dynamic section ordering
 * @author Nozibul Islam
 *
 * FIXES:
 * ✅ sectionOrder Redux থেকে নেওয়া — drag করলে preview update হবে
 * ✅ renderSection(key) — switch/case দিয়ে dynamic rendering
 * ✅ All <a> → Next.js <Link>
 * ✅ Skills empty check fixed
 * ✅ CP section — platform + View Profile পাশাপাশি
 */

'use client';

import { memo, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { formatDate } from '@/shared/lib/utils';
import {
  useAutoFontSize,
  getFontSizeLabel,
} from '@/shared/hooks/useAutoFontSize';
import logger from '@/shared/lib/logger';

// ==========================================
// DEFAULT SECTION ORDER (fallback)
// ==========================================
const DEFAULT_SECTION_ORDER = [
  'personalInfo',
  'summary',
  'workExperience',
  'projects',
  'skills',
  'education',
  'competitiveProgramming',
  'certifications',
];

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
  // SECTION ORDER FROM REDUX
  // fallback to DEFAULT_SECTION_ORDER if Redux not ready
  // ==========================================
  const sectionOrder = useSelector(
    (state) => state.resume.sectionOrder || DEFAULT_SECTION_ORDER
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
  // FILTERED DATA
  // ==========================================
  const validProjects = useMemo(() => {
    if (!Array.isArray(validData.projects)) return [];
    return validData.projects.filter(
      (p) => p && typeof p.projectName === 'string' && p.projectName.trim()
    );
  }, [validData.projects]);

  const validCPProfiles = useMemo(() => {
    if (!Array.isArray(validData.competitiveProgramming)) return [];
    return validData.competitiveProgramming.filter(
      (cp) => cp && cp.platform?.trim()
    );
  }, [validData.competitiveProgramming]);

  // ==========================================
  // SECTION RENDERERS
  // প্রতিটা section আলাদা function — null return করলে section দেখাবে না
  // ==========================================
  const renderPersonalInfo = useCallback(() => {
    if (!isSectionVisible('personalInfo') || !validData.personalInfo)
      return null;
    const p = validData.personalInfo;
    return (
      <header
        key="personalInfo"
        className={`${spacing.sectionGap} text-center border-b border-gray-800 pb-2`}
      >
        <h1
          className="text-2xl font-semibold text-gray-900 uppercase"
          style={{ letterSpacing: '0.05em' }}
        >
          {sanitizeText(p.fullName) || 'YOUR NAME'}
        </h1>
        {p.jobTitle && (
          <p className="text-sm text-gray-800 font-semibold mb-1">
            {sanitizeText(p.jobTitle)}
          </p>
        )}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 flex-wrap">
          {p.email && <span>{sanitizeText(p.email)}</span>}
          {p.phone && (
            <>
              <span>•</span>
              <span>{sanitizeText(p.phone)}</span>
            </>
          )}
          {p.location && (
            <>
              <span>•</span>
              <span>{sanitizeText(p.location)}</span>
            </>
          )}
        </div>
        {(p.linkedin || p.github || p.portfolio) && (
          <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-600 mt-1">
            {p.linkedin && (
              <Link
                href={sanitizeText(p.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                LinkedIn
              </Link>
            )}
            {p.linkedin && p.github && <span>•</span>}
            {p.github && (
              <Link
                href={sanitizeText(p.github)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                GitHub
              </Link>
            )}
            {(p.linkedin || p.github) && p.portfolio && <span>•</span>}
            {p.portfolio && (
              <Link
                href={sanitizeText(p.portfolio)}
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
    );
  }, [validData.personalInfo, isSectionVisible, spacing, sanitizeText]);

  const renderSummary = useCallback(() => {
    if (!isSectionVisible('summary') || !validData.summary?.text) return null;
    return (
      <section key="summary" className={spacing.sectionGap}>
        <h2 className="text-xs font-semibold text-gray-900 uppercase mb-1 border-b border-gray-300 pb-1 tracking-wide">
          Professional Summary
        </h2>
        <p className="text-xs text-gray-700 leading-relaxed">
          {sanitizeText(validData.summary.text)}
        </p>
      </section>
    );
  }, [validData.summary, isSectionVisible, spacing, sanitizeText]);

  const renderWorkExperience = useCallback(() => {
    if (
      !isSectionVisible('workExperience') ||
      !validData.workExperience?.length
    )
      return null;
    return (
      <section key="workExperience" className={spacing.sectionGap}>
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
                  {exp.currentlyWorking ? 'Present' : formatDate(exp.endDate)}
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
    );
  }, [validData.workExperience, isSectionVisible, spacing, sanitizeText]);

  const renderProjects = useCallback(() => {
    if (!isSectionVisible('projects') || !validProjects.length) return null;
    return (
      <section key="projects" className={spacing.sectionGap}>
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
                  {project.technologies.map((t) => sanitizeText(t)).join(', ')}
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
    );
  }, [validProjects, isSectionVisible, spacing, sanitizeText]);

  const renderSkills = useCallback(() => {
    if (!isSectionVisible('skills') || !validData.skills) return null;
    const hasSkills = Object.values(validData.skills).some(
      (v) => Array.isArray(v) && v.length > 0
    );
    if (!hasSkills) return null;
    return (
      <section key="skills" className={spacing.sectionGap}>
        <h2 className="text-xs font-semibold text-gray-900 uppercase mb-1 border-b border-gray-300 pb-1 tracking-wide">
          Technical Skills
        </h2>
        <div className="space-y-0.5">
          {Object.entries(validData.skills).map(([category, skills]) => {
            if (!Array.isArray(skills) || skills.length === 0) return null;
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
          })}
        </div>
      </section>
    );
  }, [validData.skills, isSectionVisible, spacing, sanitizeText]);

  const renderEducation = useCallback(() => {
    if (!isSectionVisible('education') || !validData.education?.length)
      return null;
    return (
      <section key="education" className={spacing.sectionGap}>
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
    );
  }, [validData.education, isSectionVisible, spacing, sanitizeText]);

  const renderCP = useCallback(() => {
    if (!isSectionVisible('competitiveProgramming') || !validCPProfiles.length)
      return null;
    return (
      <section key="competitiveProgramming" className={spacing.sectionGap}>
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
                {cp.badges?.length > 0 && (
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Badges:</span>{' '}
                    {cp.badges.map((b) => sanitizeText(b)).join(', ')}
                  </p>
                )}
              </div>
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
    );
  }, [validCPProfiles, isSectionVisible, spacing, sanitizeText]);

  const renderCertifications = useCallback(() => {
    if (
      !isSectionVisible('certifications') ||
      !validData.certifications?.length
    )
      return null;
    return (
      <section key="certifications" className={spacing.sectionGap}>
        <h2 className="text-xs font-semibold text-gray-900 uppercase mb-1 border-b border-gray-300 pb-1 tracking-wide">
          Certifications
        </h2>
        <div className={spacing.listGap}>
          {validData.certifications.map((cert, index) => (
            <div key={cert._id || index} className="flex justify-between">
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
    );
  }, [validData.certifications, isSectionVisible, spacing, sanitizeText]);

  // ==========================================
  // RENDER SECTION BY KEY
  // sectionOrder থেকে key নিয়ে সঠিক renderer call করে
  // unknown key হলে null return — crash হবে না
  // ==========================================
  const renderSection = useCallback(
    (key) => {
      switch (key) {
        case 'personalInfo':
          return renderPersonalInfo();
        case 'summary':
          return renderSummary();
        case 'workExperience':
          return renderWorkExperience();
        case 'projects':
          return renderProjects();
        case 'skills':
          return renderSkills();
        case 'education':
          return renderEducation();
        case 'competitiveProgramming':
          return renderCP();
        case 'certifications':
          return renderCertifications();
        default:
          logger.warn(`[ResumeRenderer] Unknown section key: ${key}`);
          return null;
      }
    },
    [
      renderPersonalInfo,
      renderSummary,
      renderWorkExperience,
      renderProjects,
      renderSkills,
      renderEducation,
      renderCP,
      renderCertifications,
    ]
  );

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
          {sectionOrder.map((key) => renderSection(key))}
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
