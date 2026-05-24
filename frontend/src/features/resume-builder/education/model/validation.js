/**
 * @file features/resume-builder/education/model/validation.js
 * @description Validation rules for Education
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * Synced with backend educationSchema:
 * - GPA: regex format check added (matches isValidGpa in Resume.js)
 * - Empty array no longer an error (backend default: [])
 * - MAX_EDUCATIONS used consistently
 */

import { LIMITS } from '@/shared/lib/constants';

// ── Degree ────────────────────────────────────────────────────────────────────

export function validateDegree(degree) {
  if (!degree || degree.trim() === '') return 'Degree is required';
  if (degree.length > LIMITS.TITLE_MAX_LENGTH)
    return `Degree cannot exceed ${LIMITS.TITLE_MAX_LENGTH} characters`;
  if (/^\s+$/.test(degree)) return 'Degree cannot be only whitespace';
  return null;
}

// ── Institution ───────────────────────────────────────────────────────────────

export function validateInstitution(institution) {
  if (!institution || institution.trim() === '')
    return 'Institution is required';
  if (institution.length > LIMITS.TITLE_MAX_LENGTH)
    return `Institution cannot exceed ${LIMITS.TITLE_MAX_LENGTH} characters`;
  if (/^\s+$/.test(institution)) return 'Institution cannot be only whitespace';
  return null;
}

// ── GPA ───────────────────────────────────────────────────────────────────────

/**
 * Matches backend isValidGpa:
 *   - digits only, up to 2 decimal places (e.g. 3.75)
 *   - range 0.00–4.00
 *   - empty string is valid (field is optional)
 */
export function validateGPA(gpa) {
  if (!gpa || gpa.trim() === '') return null;

  if (!/^\d+(\.\d{1,2})?$/.test(gpa.trim())) {
    return 'GPA must be a number with up to 2 decimal places (e.g. 3.75)';
  }

  const num = parseFloat(gpa);
  if (num < 0 || num > 4.0) return 'GPA must be between 0.00 and 4.00';

  return null;
}

// ── Graduation date ───────────────────────────────────────────────────────────

export function validateGraduationDate(graduationDate) {
  if (!graduationDate?.month || !graduationDate?.year)
    return 'Graduation date is required';

  const { month, year } = graduationDate;

  if (month < 1 || month > 12) return 'Invalid month';

  const currentYear = new Date().getFullYear();
  if (year < currentYear - 100 || year > currentYear + 10)
    return 'Invalid year';

  return null;
}

// ── Single education entry ────────────────────────────────────────────────────

export function validateEducation(education) {
  const errors = {};

  const degreeError = validateDegree(education.degree);
  if (degreeError) errors.degree = degreeError;

  const institutionError = validateInstitution(education.institution);
  if (institutionError) errors.institution = institutionError;

  if (education.location?.length > LIMITS.TITLE_MAX_LENGTH) {
    errors.location = `Location cannot exceed ${LIMITS.TITLE_MAX_LENGTH} characters`;
  }

  const dateError = validateGraduationDate(education.graduationDate);
  if (dateError) errors.graduationDate = dateError;

  const gpaError = validateGPA(education.gpa);
  if (gpaError) errors.gpa = gpaError;

  return errors;
}

// ── All education entries ─────────────────────────────────────────────────────

/**
 * Empty array is valid — backend accepts [].
 * Only structural and field-level errors are returned.
 */
export function validateEducationForm(educations) {
  if (!Array.isArray(educations))
    return { _form: 'Education must be an array' };

  if (educations.length > LIMITS.MAX_EDUCATIONS) {
    return {
      _form: `Maximum ${LIMITS.MAX_EDUCATIONS} education entries allowed`,
    };
  }

  const errors = {};
  educations.forEach((edu, index) => {
    const eduErrors = validateEducation(edu);
    if (Object.keys(eduErrors).length > 0) errors[index] = eduErrors;
  });

  return errors;
}

export function isEducationValid(educations) {
  return Object.keys(validateEducationForm(educations)).length === 0;
}

// ── Quality score ─────────────────────────────────────────────────────────────

export function getEducationQualityScore(education) {
  let score = 0;
  const suggestions = [];

  if (education.degree?.trim()) {
    score += 30;
  } else {
    suggestions.push('Add a degree');
  }

  if (education.institution?.trim()) {
    score += 30;
  } else {
    suggestions.push('Add institution name');
  }

  if (education.location?.trim()) score += 10;

  if (education.graduationDate?.month && education.graduationDate?.year) {
    score += 20;
  } else {
    suggestions.push('Add graduation date');
  }

  if (education.gpa?.trim()) {
    const num = parseFloat(education.gpa);
    if (!isNaN(num)) {
      if (num >= 3.0) {
        score += 10;
      } else {
        suggestions.push('Consider omitting GPA below 3.0');
      }
    }
  }

  return { score: Math.min(100, score), suggestions };
}
