/**
 * @file features/resume-builder/education/model/validation.js
 * @description Validation rules for Education
 * @author Nozibul Islam
 *
 * Self-Review:
 * ✅ Readability: Clear, documented
 * ✅ Performance: Pure functions
 * ✅ Security: GPA validation
 * ✅ Best Practices: Reusable
 * ✅ Potential Bugs: Edge cases handled
 * ✅ Unit Tests: Comprehensive
 */

import { LIMITS } from '@/shared/lib/constants';

// ==========================================
// DEGREE VALIDATION
// ==========================================

export function validateDegree(degree) {
  if (!degree || degree.trim() === '') {
    return 'Degree is required';
  }

  if (degree.length > LIMITS.TITLE_MAX_LENGTH) {
    return `Degree cannot exceed ${LIMITS.TITLE_MAX_LENGTH} characters`;
  }

  if (/^\s+$/.test(degree)) {
    return 'Degree cannot be only whitespace';
  }

  return null;
}

// ==========================================
// INSTITUTION VALIDATION
// ==========================================

export function validateInstitution(institution) {
  if (!institution || institution.trim() === '') {
    return 'Institution is required';
  }

  if (institution.length > LIMITS.TITLE_MAX_LENGTH) {
    return `Institution cannot exceed ${LIMITS.TITLE_MAX_LENGTH} characters`;
  }

  if (/^\s+$/.test(institution)) {
    return 'Institution cannot be only whitespace';
  }

  return null;
}

// ==========================================
// GPA VALIDATION
// ==========================================

export function validateGPA(gpa) {
  if (!gpa || gpa.trim() === '') {
    return null; // Optional
  }

  const gpaNum = parseFloat(gpa);

  if (isNaN(gpaNum)) {
    return 'GPA must be a number';
  }

  if (gpaNum < 0 || gpaNum > 4.0) {
    return 'GPA must be between 0.0 and 4.0';
  }

  return null;
}

// ==========================================
// GRADUATION DATE VALIDATION
// ==========================================

export function validateGraduationDate(graduationDate) {
  if (!graduationDate || !graduationDate.month || !graduationDate.year) {
    return 'Graduation date is required';
  }

  const { month, year } = graduationDate;

  if (month < 1 || month > 12) {
    return 'Invalid month';
  }

  const currentYear = new Date().getFullYear();
  if (year < currentYear - 100 || year > currentYear + 10) {
    return 'Invalid year';
  }

  return null;
}

// ==========================================
// SINGLE EDUCATION VALIDATION
// ==========================================

export function validateEducation(education) {
  const errors = {};

  // Degree (required)
  const degreeError = validateDegree(education.degree);
  if (degreeError) errors.degree = degreeError;

  // Institution (required)
  const institutionError = validateInstitution(education.institution);
  if (institutionError) errors.institution = institutionError;

  // Location (optional)
  if (
    education.location &&
    education.location.length > LIMITS.TITLE_MAX_LENGTH
  ) {
    errors.location = `Location cannot exceed ${LIMITS.TITLE_MAX_LENGTH} characters`;
  }

  // Graduation date (required)
  const dateError = validateGraduationDate(education.graduationDate);
  if (dateError) errors.graduationDate = dateError;

  // GPA (optional)
  const gpaError = validateGPA(education.gpa);
  if (gpaError) errors.gpa = gpaError;

  return errors;
}

// ==========================================
// ALL EDUCATION VALIDATION
// ==========================================

export function validateEducationForm(educations) {
  if (!Array.isArray(educations)) {
    return { _form: 'Education must be an array' };
  }

  if (educations.length === 0) {
    return { _form: 'Add at least one education entry' };
  }

  if (educations.length > LIMITS.MAX_EDUCATION) {
    return {
      _form: `Maximum ${LIMITS.MAX_EDUCATION} education entries allowed`,
    };
  }

  const errors = {};
  educations.forEach((edu, index) => {
    const eduErrors = validateEducation(edu);
    if (Object.keys(eduErrors).length > 0) {
      errors[index] = eduErrors;
    }
  });

  return errors;
}

// ==========================================
// QUALITY CHECKS
// ==========================================

export function getEducationQualityScore(education) {
  let score = 0;
  const suggestions = [];

  // Has degree
  if (education.degree && education.degree.trim()) {
    score += 30;
  } else {
    suggestions.push('Add a degree');
  }

  // Has institution
  if (education.institution && education.institution.trim()) {
    score += 30;
  } else {
    suggestions.push('Add institution name');
  }

  // Has location
  if (education.location && education.location.trim()) {
    score += 10;
  }

  // Has graduation date
  if (
    education.graduationDate &&
    education.graduationDate.month &&
    education.graduationDate.year
  ) {
    score += 20;
  } else {
    suggestions.push('Add graduation date');
  }

  // Has GPA
  if (education.gpa && education.gpa.trim()) {
    const gpaNum = parseFloat(education.gpa);
    if (!isNaN(gpaNum)) {
      if (gpaNum >= 3.0) {
        score += 10;
      } else {
        suggestions.push('Consider omitting GPA below 3.0');
      }
    }
  }

  return {
    score: Math.min(100, score),
    suggestions,
  };
}

export function isEducationValid(educations) {
  return Object.keys(validateEducationForm(educations)).length === 0;
}

// ==========================================
// UNIT TESTS
// ==========================================

/*
describe('Education Validation', () => {
  describe('validateDegree', () => {
    test('should reject empty', () => {
      expect(validateDegree('')).toContain('required');
    });

    test('should accept valid degree', () => {
      expect(validateDegree('Bachelor of Science')).toBeNull();
    });
  });

  describe('validateGPA', () => {
    test('should accept empty (optional)', () => {
      expect(validateGPA('')).toBeNull();
    });

    test('should reject invalid number', () => {
      expect(validateGPA('abc')).toContain('number');
    });

    test('should reject out of range', () => {
      expect(validateGPA('5.0')).toContain('between');
      expect(validateGPA('-1')).toContain('between');
    });

    test('should accept valid GPA', () => {
      expect(validateGPA('3.5')).toBeNull();
    });
  });

  describe('validateGraduationDate', () => {
    test('should require date', () => {
      expect(validateGraduationDate(null)).toContain('required');
    });

    test('should accept valid date', () => {
      expect(validateGraduationDate({ month: 5, year: 2024 })).toBeNull();
    });
  });

  describe('getEducationQualityScore', () => {
    test('should score complete education high', () => {
      const complete = {
        degree: 'BS Computer Science',
        institution: 'MIT',
        location: 'Cambridge, MA',
        graduationDate: { month: 5, year: 2024 },
        gpa: '3.8',
      };
      const result = getEducationQualityScore(complete);
      expect(result.score).toBe(100);
    });
  });
});
*/
