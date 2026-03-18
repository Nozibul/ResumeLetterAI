/**
 * @file widgets/resume-builder/LivePreview/ResumeRenderer.jsx
 * @description Resume renderer — dynamic section order, font, name style
 * @author Nozibul Islam
 *
 * ✅ sectionOrder from Redux — drag reorder updates preview instantly
 * ✅ customization from Redux — font + name style + section heading style
 * ✅ getSectionHeadingStyle — textTransform, fontWeight, borderBottom, fontFamily
 * ✅ All h2 — uppercase Tailwind class removed, controlled via getSectionHeadingStyle
 * ✅ personalInfo h1 — position, case, bold, font from Redux nameStyle
 * ✅ Body italic support
 * ✅ Dynamic font scaling
 * ✅ Section visibility check
 * ✅ Empty bullet/highlight/skill guard
 * ✅ XSS prevention via sanitizeText
 * ✅ All <a> replaced with Next.js <Link>
 * ✅ Unknown section key → null, no crash
 */

'use client';

import { memo, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { formatDate } from '@/shared/lib/utils';
import {
  useAutoFontSize,
  getFontSizeLabel,
} from '@/shared/hooks/useAutoFontSize';
import logger from '@/shared/lib/logger';

// ==========================================
// CONSTANTS
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

// ==========================================
// COMPONENT
// ==========================================
function ResumeRenderer({ resumeData = null, templateId = null }) {
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
  // REDUX SELECTORS
  // ==========================================

  // Section order — fallback to DEFAULT_SECTION_ORDER if Redux not ready
  const sectionOrder = useSelector(
    (state) => state.resume.sectionOrder || DEFAULT_SECTION_ORDER
  );

  // Customization — font family, name style, section heading style
  // Falls back to safe defaults if not set
  const customization = useSelector(
    (state) => state.resume.currentResumeData?.customization
  );

  // ==========================================
  // INPUT VALIDATION
  // ==========================================
  const validData = useMemo(() => {
    if (!resumeData || typeof resumeData !== 'object') {
      logger.warn('[ResumeRenderer] Invalid resumeData');
      return null;
    }
    return resumeData;
  }, [resumeData]);

  // ==========================================
  // SECTION VISIBILITY CHECK
  // Returns true if sectionVisibility not set (show by default)
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
  // SECTION HEADING STYLE
  //
  // Applies to all section h2 headings:
  //   - textTransform from sectionHeadingStyle.case
  //   - fontWeight from sectionHeadingStyle.fontWeight
  //   - borderBottom from sectionHeadingStyle.borderStyle
  //   - fontFamily from fonts.heading
  //
  // Note: Tailwind 'uppercase' class removed from all h2 —
  //       textTransform is fully controlled here
  // ==========================================
  const getSectionHeadingStyle = useCallback(() => {
    const s = customization?.sectionHeadingStyle;
    return {
      fontFamily: customization?.fonts?.heading || 'Arial',
      textTransform: s?.case || 'uppercase',
      fontWeight: s?.fontWeight || 'bold',
      textAlign: s?.position || 'left',
      borderBottom: s?.borderStyle === 'none' ? 'none' : '1px solid #d1d5db',
      paddingBottom: s?.borderStyle === 'none' ? '0' : '4px',
      marginBottom: '4px',
    };
  }, [customization]);

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
  // Pre-filter once — avoid filtering inside render functions
  // ==========================================
  const validProjects = useMemo(() => {
    if (!Array.isArray(validData?.projects)) return [];
    return validData.projects.filter(
      (p) => p && typeof p.projectName === 'string' && p.projectName.trim()
    );
  }, [validData?.projects]);

  const validCPProfiles = useMemo(() => {
    if (!Array.isArray(validData?.competitiveProgramming)) return [];
    return validData.competitiveProgramming.filter(
      (cp) => cp && cp.platform?.trim()
    );
  }, [validData?.competitiveProgramming]);

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
  // SECTION RENDERERS
  // Each returns null if no data — section simply skipped
  // Note: h2 className no longer has 'uppercase' — handled by getSectionHeadingStyle
  // ==========================================

  const renderPersonalInfo = useCallback(() => {
    if (!isSectionVisible('personalInfo') || !validData.personalInfo)
      return null;
    const p = validData.personalInfo;
    if (!p.fullName?.trim() && !p.email?.trim()) return null;

    return (
      <header
        key="personalInfo"
        className={`${spacing.sectionGap} text-center border-b border-gray-800 pb-2`}
      >
        {/* Name style — position, case, bold, heading font all from Redux
            Tailwind uppercase class removed — textTransform handles it */}
        <h1
          className="text-2xl text-gray-900"
          style={{
            letterSpacing: '0.05em',
            textAlign: customization?.nameStyle?.position || 'center',
            textTransform: customization?.nameStyle?.case || 'uppercase',
            fontWeight: customization?.nameStyle?.bold ? 'bold' : 'normal',
            fontFamily: customization?.fonts?.heading || 'Arial',
          }}
        >
          {sanitizeText(p.fullName) || 'YOUR NAME'}
        </h1>

        {p.jobTitle?.trim() && (
          <p className="text-sm text-gray-800 font-semibold mb-1">
            {sanitizeText(p.jobTitle)}
          </p>
        )}

        {(p.email || p.phone || p.location) && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600 flex-wrap">
            {p.email && <span>{sanitizeText(p.email)}</span>}
            {p.email && p.phone && <span>•</span>}
            {p.phone && <span>{sanitizeText(p.phone)}</span>}
            {(p.email || p.phone) && p.location && <span>•</span>}
            {p.location && <span>{sanitizeText(p.location)}</span>}
          </div>
        )}

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
  }, [
    validData.personalInfo,
    isSectionVisible,
    spacing,
    sanitizeText,
    customization,
  ]);

  const renderSummary = useCallback(() => {
    const text = validData.summary?.text?.trim();
    if (!isSectionVisible('summary') || !text) return null;

    return (
      <section key="summary" className={spacing.sectionGap}>
        <h2
          className="text-xs text-gray-900 tracking-wide"
          style={getSectionHeadingStyle()}
        >
          Professional Summary
        </h2>
        <p className="text-xs text-gray-700 leading-relaxed">
          {sanitizeText(text)}
        </p>
      </section>
    );
  }, [
    validData.summary,
    isSectionVisible,
    spacing,
    sanitizeText,
    getSectionHeadingStyle,
  ]);

  const renderWorkExperience = useCallback(() => {
    if (
      !isSectionVisible('workExperience') ||
      !validData.workExperience?.length
    )
      return null;

    const validExperiences = validData.workExperience.filter(
      (exp) => exp?.jobTitle?.trim() || exp?.company?.trim()
    );
    if (!validExperiences.length) return null;

    return (
      <section key="workExperience" className={spacing.sectionGap}>
        <h2
          className="text-xs text-gray-900 tracking-wide"
          style={getSectionHeadingStyle()}
        >
          Work Experience
        </h2>
        <div className={spacing.listGap}>
          {validExperiences.map((exp, index) => {
            const validResponsibilities = (exp.responsibilities || []).filter(
              (r) => typeof r === 'string' && r.trim()
            );
            return (
              <div key={exp._id || index}>
                <div className="flex justify-between items-start mb-0.5">
                  <div>
                    {exp.jobTitle?.trim() && (
                      <h3 className="font-semibold text-gray-900 text-xs">
                        {sanitizeText(exp.jobTitle)}
                      </h3>
                    )}
                    {exp.company?.trim() && (
                      <p className="text-gray-600 italic text-xs">
                        {sanitizeText(exp.company)}
                        {exp.location?.trim() &&
                          ` — ${sanitizeText(exp.location)}`}
                      </p>
                    )}
                  </div>
                  {(exp.startDate || exp.endDate || exp.currentlyWorking) && (
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {formatDate(exp.startDate)} –{' '}
                      {exp.currentlyWorking
                        ? 'Present'
                        : formatDate(exp.endDate)}
                    </span>
                  )}
                </div>
                {validResponsibilities.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-gray-700 mt-0.5">
                    {validResponsibilities.map((resp, idx) => (
                      <li key={idx} className="text-xs">
                        {sanitizeText(resp)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  }, [
    validData.workExperience,
    isSectionVisible,
    spacing,
    sanitizeText,
    getSectionHeadingStyle,
  ]);

  const renderProjects = useCallback(() => {
    if (!isSectionVisible('projects') || !validProjects.length) return null;

    return (
      <section key="projects" className={spacing.sectionGap}>
        <h2
          className="text-xs text-gray-900 tracking-wide"
          style={getSectionHeadingStyle()}
        >
          Projects
        </h2>
        <div className={spacing.listGap}>
          {validProjects.map((project, index) => {
            const validHighlights = (project.highlights || []).filter(
              (h) => typeof h === 'string' && h.trim()
            );
            return (
              <div key={project._id || index}>
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-semibold text-gray-900 text-xs">
                    {sanitizeText(project.projectName)}
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    {project.liveUrl?.trim() && (
                      <Link
                        href={sanitizeText(project.liveUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline"
                      >
                        🔗 Live
                      </Link>
                    )}
                    {project.sourceCode?.trim() && (
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
                      .filter((t) => t?.trim())
                      .map((t) => sanitizeText(t))
                      .join(', ')}
                  </p>
                )}
                {project.description?.trim() && (
                  <p className="text-xs text-gray-700 mb-0.5">
                    {sanitizeText(project.description)}
                  </p>
                )}
                {validHighlights.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-gray-700">
                    {validHighlights.map((highlight, idx) => (
                      <li key={idx} className="text-xs">
                        {sanitizeText(highlight)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  }, [
    validProjects,
    isSectionVisible,
    spacing,
    sanitizeText,
    getSectionHeadingStyle,
  ]);

  const renderSkills = useCallback(() => {
    if (!isSectionVisible('skills') || !validData.skills) return null;
    const hasSkills = Object.values(validData.skills).some(
      (v) => Array.isArray(v) && v.length > 0
    );
    if (!hasSkills) return null;

    return (
      <section key="skills" className={spacing.sectionGap}>
        <h2
          className="text-xs text-gray-900 tracking-wide"
          style={getSectionHeadingStyle()}
        >
          Technical Skills
        </h2>
        <div className="space-y-0.5">
          {Object.entries(validData.skills).map(([category, skills]) => {
            if (!Array.isArray(skills) || skills.length === 0) return null;
            const validSkills = skills.filter((s) => s?.trim());
            if (!validSkills.length) return null;
            return (
              <div key={category} className="flex gap-1 text-xs">
                <span className="font-semibold text-gray-800 shrink-0 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="text-gray-700">
                  {validSkills.map((s) => sanitizeText(s)).join(', ')}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    );
  }, [
    validData.skills,
    isSectionVisible,
    spacing,
    sanitizeText,
    getSectionHeadingStyle,
  ]);

  const renderEducation = useCallback(() => {
    if (!isSectionVisible('education') || !validData.education?.length)
      return null;
    const validEducation = validData.education.filter(
      (edu) => edu?.degree?.trim() || edu?.institution?.trim()
    );
    if (!validEducation.length) return null;

    return (
      <section key="education" className={spacing.sectionGap}>
        <h2
          className="text-xs text-gray-900 tracking-wide"
          style={getSectionHeadingStyle()}
        >
          Education
        </h2>
        <div className={spacing.listGap}>
          {validEducation.map((edu, index) => (
            <div key={edu._id || index} className="flex justify-between">
              <div>
                {edu.degree?.trim() && (
                  <h3 className="font-semibold text-gray-900 text-xs">
                    {sanitizeText(edu.degree)}
                  </h3>
                )}
                {edu.institution?.trim() && (
                  <p className="text-gray-600 italic text-xs">
                    {sanitizeText(edu.institution)}
                    {edu.location?.trim() && ` — ${sanitizeText(edu.location)}`}
                  </p>
                )}
                {edu.gpa?.trim() && (
                  <p className="text-xs text-gray-500">
                    GPA: {sanitizeText(edu.gpa)}
                  </p>
                )}
              </div>
              {edu.graduationDate && (
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {formatDate(edu.graduationDate)}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }, [
    validData.education,
    isSectionVisible,
    spacing,
    sanitizeText,
    getSectionHeadingStyle,
  ]);

  const renderCP = useCallback(() => {
    if (!isSectionVisible('competitiveProgramming') || !validCPProfiles.length)
      return null;

    return (
      <section key="competitiveProgramming" className={spacing.sectionGap}>
        <h2
          className="text-xs text-gray-900 tracking-wide"
          style={getSectionHeadingStyle()}
        >
          Competitive Programming
        </h2>
        <div className={spacing.listGap}>
          {validCPProfiles.map((cp, index) => {
            const validBadges = (cp.badges || []).filter((b) => b?.trim());
            return (
              <div
                key={cp._id || index}
                className="flex justify-between items-start"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 text-xs flex items-center gap-2">
                    {sanitizeText(cp.platform)}
                    {cp.profileUrl?.trim() && (
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
                  {validBadges.length > 0 && (
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">Badges:</span>{' '}
                      {validBadges.map((b) => sanitizeText(b)).join(', ')}
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
            );
          })}
        </div>
      </section>
    );
  }, [
    validCPProfiles,
    isSectionVisible,
    spacing,
    sanitizeText,
    getSectionHeadingStyle,
  ]);

  const renderCertifications = useCallback(() => {
    if (
      !isSectionVisible('certifications') ||
      !validData.certifications?.length
    )
      return null;
    const validCerts = validData.certifications.filter((c) =>
      c?.certificationName?.trim()
    );
    if (!validCerts.length) return null;

    return (
      <section key="certifications" className={spacing.sectionGap}>
        <h2
          className="text-xs text-gray-900 tracking-wide"
          style={getSectionHeadingStyle()}
        >
          Certifications
        </h2>
        <div className={spacing.listGap}>
          {validCerts.map((cert, index) => (
            <div key={cert._id || index} className="flex justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-xs">
                  {sanitizeText(cert.certificationName)}
                </h3>
                {cert.issuer?.trim() && (
                  <p className="text-xs text-gray-500">
                    {sanitizeText(cert.issuer)}
                  </p>
                )}
                {cert.credentialUrl?.trim() && (
                  <Link
                    href={sanitizeText(cert.credentialUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal-600 hover:underline"
                  >
                    View Credential
                  </Link>
                )}
              </div>
              {cert.issueDate && (
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {formatDate(cert.issueDate)}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }, [
    validData.certifications,
    isSectionVisible,
    spacing,
    sanitizeText,
    getSectionHeadingStyle,
  ]);

  // ==========================================
  // RENDER SECTION BY KEY
  // Unknown key → null, no crash
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
        {/* Body font + italic applied to entire content area
            Heading font overrides per-element via getSectionHeadingStyle / h1 style */}
        <div
          ref={containerRef}
          className={spacing.padding}
          style={{
            fontSize: `${fontSize}pt`,
            lineHeight: spacing.lineHeight,
            fontFamily: customization?.fonts?.body || 'Arial',
            fontStyle: customization?.fonts?.italic ? 'italic' : 'normal',
          }}
        >
          {sectionOrder.map((key) => renderSection(key))}
        </div>
      </div>
    </div>
  );
}

export default memo(ResumeRenderer);
