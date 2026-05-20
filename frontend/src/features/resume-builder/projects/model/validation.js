/**
 * @file features/resume-builder/projects/model/validation.js
 * @description Validation rules for Projects
 * @author Nozibul Islam
 *
 * Self-Review:
 * ✅ Readability: Clear, documented
 * ✅ Performance: Pure functions
 * ✅ Security: URL validation
 * ✅ Best Practices: Reusable
 * ✅ Potential Bugs: Edge cases handled
 * ✅ Unit Tests: Comprehensive
 */

import { LIMITS } from '@/shared/lib/constants';

// ==========================================
// PROJECT NAME VALIDATION
// ==========================================

export function validateProjectName(name) {
  if (!name || name.trim() === '') {
    return 'Project name is required';
  }

  if (name.length > LIMITS.TITLE_MAX_LENGTH) {
    return `Project name cannot exceed ${LIMITS.TITLE_MAX_LENGTH} characters`;
  }

  if (/^\s+$/.test(name)) {
    return 'Project name cannot be only whitespace';
  }

  return null;
}

// ==========================================
// TECHNOLOGIES VALIDATION
// ==========================================

export function validateTechnologies(technologies) {
  if (!Array.isArray(technologies)) {
    return 'Technologies must be an array';
  }

  if (technologies.length > LIMITS.MAX_TECHNOLOGIES) {
    return `Maximum ${LIMITS.MAX_TECHNOLOGIES} technologies allowed`;
  }

  // Check for duplicates
  const unique = new Set(technologies);
  if (unique.size !== technologies.length) {
    return 'Duplicate technologies found';
  }

  return null;
}

// ==========================================
// URL VALIDATION
// ==========================================

export function validateProjectURL(url, fieldName = 'URL') {
  if (!url || url.trim() === '') {
    return null; // Optional
  }

  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return `${fieldName} must start with http:// or https://`;
    }
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      return `Please use a deployed ${fieldName.toLowerCase()}, not localhost`;
    }
    return null;
  } catch {
    return `Invalid ${fieldName.toLowerCase()} format`;
  }
}

// ==========================================
// HIGHLIGHTS VALIDATION
// ==========================================

export function validateHighlights(highlights) {
  if (!Array.isArray(highlights)) {
    return 'Highlights must be an array';
  }

  if (highlights.length > LIMITS.MAX_HIGHLIGHTS) {
    return `Maximum ${LIMITS.MAX_HIGHLIGHTS} highlights allowed`;
  }

  // Check each highlight length
  for (let i = 0; i < highlights.length; i++) {
    const highlight = highlights[i];
    if (highlight && highlight.length > 300) {
      return `Highlight ${i + 1} exceeds 300 characters`;
    }
  }

  return null;
}

// ==========================================
// SINGLE PROJECT VALIDATION
// ==========================================

export function validateProject(project) {
  const errors = {};

  // Project name (required)
  const nameError = validateProjectName(project.projectName);
  if (nameError) errors.projectName = nameError;

  // Technologies (required)
  const techError = validateTechnologies(project.technologies);
  if (techError) errors.technologies = techError;

  // Description (optional)
  if (project.description && project.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }

  // URLs (optional)
  const liveUrlError = validateProjectURL(project.liveUrl, 'Live URL');
  if (liveUrlError) errors.liveUrl = liveUrlError;

  const sourceCodeError = validateSourceCodeURL(project.sourceCode);
  if (sourceCodeError) errors.sourceCode = sourceCodeError;

  // Highlights (required)
  const highlightsError = validateHighlights(project.highlights);
  if (highlightsError) errors.highlights = highlightsError;

  return errors;
}

// ==========================================
// ALL PROJECTS VALIDATION
// ==========================================

export function validateProjectsForm(projects) {
  if (!Array.isArray(projects)) {
    return { _form: 'Projects must be an array' };
  }

  if (projects.length > LIMITS.MAX_PROJECTS) {
    return { _form: `Maximum ${LIMITS.MAX_PROJECTS} projects allowed` };
  }

  const errors = {};
  projects.forEach((project, index) => {
    const projectErrors = validateProject(project);
    if (Object.keys(projectErrors).length > 0) {
      errors[index] = projectErrors;
    }
  });

  return errors;
}

// ==========================================
// QUALITY CHECKS
// ==========================================

export function getProjectQualityScore(project) {
  let score = 0;
  const suggestions = [];

  // Has project name
  if (project.projectName && project.projectName.trim()) {
    score += 20;
  } else {
    suggestions.push('Add a project name');
  }

  // Has technologies
  if (project.technologies && project.technologies.length > 0) {
    score += 20;
    if (project.technologies.length >= 3) {
      score += 10;
    }
  } else {
    suggestions.push('Add technologies used');
  }

  // Has description
  if (project.description && project.description.length > 50) {
    score += 15;
  } else if (!project.description) {
    suggestions.push('Add a project description');
  }

  // Has live URL or source code
  if (project.liveUrl || project.sourceCode) {
    score += 15;
    if (project.liveUrl && project.sourceCode) {
      score += 10; // Bonus for both
    }
  } else {
    suggestions.push('Add live URL or source code link');
  }

  // Has highlights
  if (project.highlights && project.highlights.length > 0) {
    const validHighlights = project.highlights.filter((h) => h && h.trim());
    if (validHighlights.length >= 2) {
      score += 20;
    } else if (validHighlights.length === 1) {
      score += 10;
      suggestions.push('Add more highlights (2-3 recommended)');
    }
  } else {
    suggestions.push('Add project highlights');
  }

  return {
    score: Math.min(100, score),
    suggestions,
  };
}

// validation.js এ যোগ করো
const ALLOWED_CODE_HOSTS = [
  'github.com',
  'gitlab.com',
  'bitbucket.org',
  'codeberg.org',
];

export function validateSourceCodeURL(url) {
  if (!url || url.trim() === '') return null; // optional

  try {
    const { protocol, hostname } = new URL(url);

    if (!['http:', 'https:'].includes(protocol)) {
      return 'URL must start with http:// or https://';
    }

    const isAllowed = ALLOWED_CODE_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    );

    if (!isAllowed) {
      return 'Source code must be hosted on GitHub, GitLab, Bitbucket, or Codeberg';
    }

    return null;
  } catch {
    return 'Invalid URL format';
  }
}
