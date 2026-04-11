/**
 * @file HtmlBuilderService.js
 * @description Builds sectionsHTML string for resume PDF template.
 *              Mirrors ResumeRenderer.jsx section rendering logic.
 *              Pure functions — no side effects, no DB calls.
 * @module modules/pdf/services/HtmlBuilderService
 * @author Nozibul Islam
 */

'use strict';

const { formatDate } = require('../../../shared/utils/dateUtils');
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
// SANITIZE
// Mirrors ResumeRenderer sanitizeText()
// Prevents XSS in generated HTML
// ==========================================

/**
 * Sanitize text to prevent XSS
 * @param {string} text
 * @returns {string}
 */
const sanitize = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
};

/**
 * Sanitize URL — only allow http/https
 * @param {string} url
 * @returns {string}
 */
const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return '#';
  return sanitize(trimmed);
};

// ==========================================
// SECTION VISIBILITY
// Mirrors ResumeRenderer isSectionVisible()
// ==========================================

/**
 * Check if section is visible
 * @param {Object} sectionVisibility
 * @param {string} key
 * @returns {boolean}
 */
const isSectionVisible = (sectionVisibility, key) => {
  if (!sectionVisibility || typeof sectionVisibility !== 'object') return true;
  return sectionVisibility[key] !== false;
};

// ==========================================
// SECTION RENDERERS
// Each returns HTML string or '' if no data.
// Mirrors ResumeRenderer render* functions exactly.
// ==========================================

/**
 * Render summary section
 * @param {Object} resumeData
 * @returns {string}
 */
const renderSummary = (resumeData) => {
  const text = resumeData?.summary?.text?.trim();
  if (!text) return '';

  return `
    <section class="section-gap">
      <h2 class="text-xs text-gray-900 tracking-wide resume-section-h2">
        Professional Summary
      </h2>
      <p class="text-xs text-gray-700 leading-relaxed">${sanitize(text)}</p>
    </section>`.trim();
};

/**
 * Render work experience section
 * @param {Object} resumeData
 * @returns {string}
 */
const renderWorkExperience = (resumeData) => {
  if (!Array.isArray(resumeData?.workExperience)) return '';

  const validExperiences = resumeData.workExperience.filter(
    (exp) => exp?.jobTitle?.trim() || exp?.company?.trim()
  );
  if (!validExperiences.length) return '';

  const items = validExperiences.map((exp) => {
    const responsibilities = (exp.responsibilities || [])
      .filter((r) => typeof r === 'string' && r.trim())
      .map((r) => `<li class="text-xs">${sanitize(r)}</li>`)
      .join('');

    const dateStr =
      exp.startDate || exp.endDate || exp.currentlyWorking
        ? `<span class="text-xs text-gray-500 whitespace-nowrap ml-4">
             ${formatDate(exp.startDate)} – ${exp.currentlyWorking ? 'Present' : formatDate(exp.endDate)}
           </span>`
        : '';

    const locationStr = exp.location?.trim()
      ? ` — ${sanitize(exp.location)}`
      : '';

    return `
      <div>
        <div class="flex justify-between items-start mb-0.5">
          <div>
            ${exp.jobTitle?.trim() ? `<h3 class="font-semibold text-gray-900 text-xs">${sanitize(exp.jobTitle)}</h3>` : ''}
            ${exp.company?.trim() ? `<p class="text-gray-600 italic text-xs">${sanitize(exp.company)}${locationStr}</p>` : ''}
          </div>
          ${dateStr}
        </div>
        ${responsibilities ? `<ul class="list-disc list-inside list-gap-sm text-gray-700 mt-0.5">${responsibilities}</ul>` : ''}
      </div>`.trim();
  });

  return `
    <section class="section-gap">
      <h2 class="text-xs text-gray-900 tracking-wide resume-section-h2">
        Work Experience
      </h2>
      <div class="list-gap">${items.join('')}</div>
    </section>`.trim();
};

/**
 * Render projects section
 * @param {Object} resumeData
 * @returns {string}
 */
const renderProjects = (resumeData) => {
  if (!Array.isArray(resumeData?.projects)) return '';

  const validProjects = resumeData.projects.filter(
    (p) => p && typeof p.projectName === 'string' && p.projectName.trim()
  );
  if (!validProjects.length) return '';

  const items = validProjects.map((project) => {
    const highlights = (project.highlights || [])
      .filter((h) => typeof h === 'string' && h.trim())
      .map((h) => `<li class="text-xs">${sanitize(h)}</li>`)
      .join('');

    const technologies = (project.technologies || [])
      .filter((t) => t?.trim())
      .map((t) => sanitize(t))
      .join(', ');

    const links = [
      project.liveUrl?.trim()
        ? `<a href="${sanitizeUrl(project.liveUrl)}" class="text-teal-600">🔗 Live</a>`
        : '',
      project.sourceCode?.trim()
        ? `<a href="${sanitizeUrl(project.sourceCode)}" class="text-teal-600">📂 Code</a>`
        : '',
    ]
      .filter(Boolean)
      .join('');

    return `
      <div>
        <div class="flex items-center justify-between mb-0.5">
          <h3 class="font-semibold text-gray-900 text-xs">${sanitize(project.projectName)}</h3>
          ${links ? `<div class="flex items-center gap-2 text-xs">${links}</div>` : ''}
        </div>
        ${technologies ? `<p class="text-xs text-gray-600 mb-0.5"><span class="font-semibold">Tech Stack:</span> ${technologies}</p>` : ''}
        ${project.description?.trim() ? `<p class="text-xs text-gray-700 mb-0.5">${sanitize(project.description)}</p>` : ''}
        ${highlights ? `<ul class="list-disc list-inside list-gap-sm text-gray-700">${highlights}</ul>` : ''}
      </div>`.trim();
  });

  return `
    <section class="section-gap">
      <h2 class="text-xs text-gray-900 tracking-wide resume-section-h2">
        Projects
      </h2>
      <div class="list-gap">${items.join('')}</div>
    </section>`.trim();
};

/**
 * Render skills section
 * @param {Object} resumeData
 * @returns {string}
 */
const renderSkills = (resumeData) => {
  if (!resumeData?.skills || typeof resumeData.skills !== 'object') return '';

  const skillRows = Object.entries(resumeData.skills)
    .filter(([, skills]) => Array.isArray(skills) && skills.length > 0)
    .map(([category, skills]) => {
      const validSkills = skills.filter((s) => s?.trim()).map(sanitize);
      if (!validSkills.length) return '';

      const label = category.replace(/([A-Z])/g, ' $1').trim();

      return `
        <div class="flex gap-1 text-xs">
          <span class="font-semibold text-gray-800 shrink-0 capitalize">${sanitize(label)}:</span>
          <span class="text-gray-700">${validSkills.join(', ')}</span>
        </div>`.trim();
    })
    .filter(Boolean);

  if (!skillRows.length) return '';

  return `
    <section class="section-gap">
      <h2 class="text-xs text-gray-900 tracking-wide resume-section-h2">
        Technical Skills
      </h2>
      <div class="list-gap-sm">${skillRows.join('')}</div>
    </section>`.trim();
};

/**
 * Render education section
 * @param {Object} resumeData
 * @returns {string}
 */
const renderEducation = (resumeData) => {
  if (!Array.isArray(resumeData?.education)) return '';

  const validEducation = resumeData.education.filter(
    (edu) => edu?.degree?.trim() || edu?.institution?.trim()
  );
  if (!validEducation.length) return '';

  const items = validEducation.map((edu) => {
    const locationStr = edu.location?.trim()
      ? ` — ${sanitize(edu.location)}`
      : '';

    return `
      <div class="flex justify-between">
        <div>
          ${edu.degree?.trim() ? `<h3 class="font-semibold text-gray-900 text-xs">${sanitize(edu.degree)}</h3>` : ''}
          ${edu.institution?.trim() ? `<p class="text-gray-600 italic text-xs">${sanitize(edu.institution)}${locationStr}</p>` : ''}
          ${edu.gpa?.trim() ? `<p class="text-xs text-gray-500">GPA: ${sanitize(edu.gpa)}</p>` : ''}
        </div>
        ${edu.graduationDate ? `<span class="text-xs text-gray-500 whitespace-nowrap ml-4">${formatDate(edu.graduationDate)}</span>` : ''}
      </div>`.trim();
  });

  return `
    <section class="section-gap">
      <h2 class="text-xs text-gray-900 tracking-wide resume-section-h2">
        Education
      </h2>
      <div class="list-gap">${items.join('')}</div>
    </section>`.trim();
};

/**
 * Render competitive programming section
 * @param {Object} resumeData
 * @returns {string}
 */
const renderCompetitiveProgramming = (resumeData) => {
  if (!Array.isArray(resumeData?.competitiveProgramming)) return '';

  const validProfiles = resumeData.competitiveProgramming.filter((cp) =>
    cp?.platform?.trim()
  );
  if (!validProfiles.length) return '';

  const items = validProfiles.map((cp) => {
    const badges = (cp.badges || [])
      .filter((b) => b?.trim())
      .map(sanitize)
      .join(', ');

    const profileLink = cp.profileUrl?.trim()
      ? `<a href="${sanitizeUrl(cp.profileUrl)}" class="text-teal-600 font-normal ml-2">View Profile</a>`
      : '';

    return `
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-semibold text-gray-900 text-xs">
            ${sanitize(cp.platform)}${profileLink}
          </h3>
          ${badges ? `<p class="text-xs text-gray-600"><span class="font-semibold">Badges:</span> ${badges}</p>` : ''}
        </div>
        ${cp.problemsSolved > 0 ? `<p class="text-xs text-gray-600 text-right">Solved: <span class="font-semibold text-gray-800">${parseInt(cp.problemsSolved, 10)}</span></p>` : ''}
      </div>`.trim();
  });

  return `
    <section class="section-gap">
      <h2 class="text-xs text-gray-900 tracking-wide resume-section-h2">
        Competitive Programming
      </h2>
      <div class="list-gap">${items.join('')}</div>
    </section>`.trim();
};

/**
 * Render certifications section
 * @param {Object} resumeData
 * @returns {string}
 */
const renderCertifications = (resumeData) => {
  if (!Array.isArray(resumeData?.certifications)) return '';

  const validCerts = resumeData.certifications.filter((c) =>
    c?.certificationName?.trim()
  );
  if (!validCerts.length) return '';

  const items = validCerts.map((cert) => {
    return `
      <div class="flex justify-between">
        <div>
          <h3 class="font-semibold text-gray-900 text-xs">${sanitize(cert.certificationName)}</h3>
          ${cert.issuer?.trim() ? `<p class="text-xs text-gray-500">${sanitize(cert.issuer)}</p>` : ''}
          ${cert.credentialUrl?.trim() ? `<a href="${sanitizeUrl(cert.credentialUrl)}" class="text-xs text-teal-600">View Credential</a>` : ''}
        </div>
        ${cert.issueDate ? `<span class="text-xs text-gray-500 whitespace-nowrap ml-4">${formatDate(cert.issueDate)}</span>` : ''}
      </div>`.trim();
  });

  return `
    <section class="section-gap">
      <h2 class="text-xs text-gray-900 tracking-wide resume-section-h2">
        Certifications
      </h2>
      <div class="list-gap">${items.join('')}</div>
    </section>`.trim();
};

// ==========================================
// SECTION DISPATCHER
// Mirrors ResumeRenderer renderSection()
// Unknown key → '' (no crash)
// ==========================================

/**
 * Render a single section by key
 * @param {string} key
 * @param {Object} resumeData
 * @returns {string}
 */
const renderSection = (key, resumeData) => {
  switch (key) {
    case 'summary':
      return renderSummary(resumeData);
    case 'workExperience':
      return renderWorkExperience(resumeData);
    case 'projects':
      return renderProjects(resumeData);
    case 'skills':
      return renderSkills(resumeData);
    case 'education':
      return renderEducation(resumeData);
    case 'competitiveProgramming':
      return renderCompetitiveProgramming(resumeData);
    case 'certifications':
      return renderCertifications(resumeData);
    default:
      return '';
  }
};

// ==========================================
// PERSONAL INFO BUILDER
// Mirrors ResumeRenderer renderPersonalInfo()
// ==========================================

/**
 * Build personalInfo template variables
 * @param {Object} personalInfo
 * @returns {Object} Template variables for personalInfo block
 */
const buildPersonalInfoVars = (personalInfo) => {
  if (!personalInfo || typeof personalInfo !== 'object') return null;

  const p = personalInfo;
  if (!p.fullName?.trim() && !p.email?.trim()) return null;

  return {
    fullName: sanitize(p.fullName) || 'YOUR NAME',
    jobTitle: p.jobTitle?.trim() ? sanitize(p.jobTitle) : '',
    email: p.email?.trim() ? sanitize(p.email) : '',
    phone: p.phone?.trim() ? sanitize(p.phone) : '',
    location: p.location?.trim() ? sanitize(p.location) : '',
    linkedin: p.linkedin?.trim() ? sanitizeUrl(p.linkedin) : '',
    github: p.github?.trim() ? sanitizeUrl(p.github) : '',
    portfolio: p.portfolio?.trim() ? sanitizeUrl(p.portfolio) : '',
    // Computed booleans — for conditional separators
    hasContact: !!(p.email || p.phone || p.location),
    hasSocial: !!(p.linkedin || p.github || p.portfolio),
    email_and_phone: !!(p.email && p.phone),
    contact_and_location: !!((p.email || p.phone) && p.location),
    linkedin_and_github: !!(p.linkedin && p.github),
    social_and_portfolio: !!((p.linkedin || p.github) && p.portfolio),
  };
};

// ==========================================
// MAIN EXPORT
// ==========================================

/**
 * Build sectionsHTML string from resumeData.
 * Respects sectionOrder and sectionVisibility.
 *
 * @param {Object} resumeData - Full resume data from Redux/DB
 * @returns {Object} { personalInfo, sectionsHTML }
 */
exports.buildResumeHTML = (resumeData) => {
  if (!resumeData || typeof resumeData !== 'object') {
    throw new Error('HtmlBuilderService: resumeData is required');
  }

  // Section order — use from data or fall back to default
  const sectionOrder = Array.isArray(resumeData.sectionOrder)
    ? resumeData.sectionOrder
    : DEFAULT_SECTION_ORDER;

  const sectionVisibility = resumeData.sectionVisibility || {};

  // Build sectionsHTML — skip personalInfo (rendered separately in template)
  const sectionsHTML = sectionOrder
    .filter((key) => key !== 'personalInfo')
    .filter((key) => isSectionVisible(sectionVisibility, key))
    .map((key) => renderSection(key, resumeData))
    .filter(Boolean)
    .join('\n');

  // personalInfo always visible — ATS requires it
  // sectionVisibility check intentionally skipped
  const personalInfo = buildPersonalInfoVars(resumeData.personalInfo);

  return {
    personalInfo, // Object — used by Handlebars for header block
    sectionsHTML, // String — injected as {{{sectionsHTML}}} in template
  };
};
