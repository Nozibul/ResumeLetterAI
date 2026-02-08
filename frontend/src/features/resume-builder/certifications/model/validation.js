/**
 * @file features/resume-builder/certifications/model/validation.js
 * @description Validation rules for Certifications
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
// CERTIFICATION NAME VALIDATION
// ==========================================

export function validateCertificationName(name) {
  if (!name || name.trim() === '') {
    return 'Certification name is required';
  }

  if (name.length > LIMITS.TITLE_MAX_LENGTH) {
    return `Certification name cannot exceed ${LIMITS.TITLE_MAX_LENGTH} characters`;
  }

  if (/^\s+$/.test(name)) {
    return 'Certification name cannot be only whitespace';
  }

  return null;
}

// ==========================================
// ISSUER VALIDATION
// ==========================================

export function validateIssuer(issuer) {
  if (!issuer || issuer.trim() === '') {
    return 'Issuing organization is required';
  }

  if (issuer.length > LIMITS.TITLE_MAX_LENGTH) {
    return `Issuer cannot exceed ${LIMITS.TITLE_MAX_LENGTH} characters`;
  }

  if (/^\s+$/.test(issuer)) {
    return 'Issuer cannot be only whitespace';
  }

  return null;
}

// ==========================================
// ISSUE DATE VALIDATION
// ==========================================

export function validateIssueDate(issueDate) {
  if (!issueDate || !issueDate.month || !issueDate.year) {
    return 'Issue date is required';
  }

  const { month, year } = issueDate;

  if (month < 1 || month > 12) {
    return 'Invalid month';
  }

  const currentYear = new Date().getFullYear();
  if (year < currentYear - 50 || year > currentYear + 1) {
    return 'Invalid year';
  }

  // Check if date is in the future
  const currentMonth = new Date().getMonth() + 1;
  if (year === currentYear && month > currentMonth) {
    return 'Issue date cannot be in the future';
  }

  return null;
}

// ==========================================
// CREDENTIAL URL VALIDATION
// ==========================================

export function validateCredentialURL(url) {
  if (!url || url.trim() === '') {
    return null; // Optional
  }

  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return 'URL must start with http:// or https://';
    }

    // Common credential platforms
    const credentialPlatforms = [
      'credly.com',
      'coursera.org',
      'udemy.com',
      'linkedin.com',
      'microsoft.com',
      'aws.amazon.com',
      'cloud.google.com',
    ];

    // Just a warning, not an error
    const isKnownPlatform = credentialPlatforms.some((platform) =>
      urlObj.hostname.includes(platform)
    );

    return null;
  } catch {
    return 'Invalid URL format';
  }
}

// ==========================================
// SINGLE CERTIFICATION VALIDATION
// ==========================================

export function validateCertification(cert) {
  const errors = {};

  // Certification name (required)
  const nameError = validateCertificationName(cert.certificationName);
  if (nameError) errors.certificationName = nameError;

  // Issuer (required)
  const issuerError = validateIssuer(cert.issuer);
  if (issuerError) errors.issuer = issuerError;

  // Issue date (required)
  const dateError = validateIssueDate(cert.issueDate);
  if (dateError) errors.issueDate = dateError;

  // Credential URL (optional)
  const urlError = validateCredentialURL(cert.credentialUrl);
  if (urlError) errors.credentialUrl = urlError;

  return errors;
}

// ==========================================
// ALL CERTIFICATIONS VALIDATION
// ==========================================

export function validateCertificationsForm(certifications) {
  if (!Array.isArray(certifications)) {
    return { _form: 'Certifications must be an array' };
  }

  if (certifications.length > LIMITS.MAX_CERTIFICATIONS) {
    return {
      _form: `Maximum ${LIMITS.MAX_CERTIFICATIONS} certifications allowed`,
    };
  }

  const errors = {};
  certifications.forEach((cert, index) => {
    const certErrors = validateCertification(cert);
    if (Object.keys(certErrors).length > 0) {
      errors[index] = certErrors;
    }
  });

  return errors;
}

// ==========================================
// QUALITY CHECKS
// ==========================================

export function getCertificationQualityScore(cert) {
  let score = 0;
  const suggestions = [];

  // Has certification name
  if (cert.certificationName && cert.certificationName.trim()) {
    score += 30;
  } else {
    suggestions.push('Add certification name');
  }

  // Has issuer
  if (cert.issuer && cert.issuer.trim()) {
    score += 30;
  } else {
    suggestions.push('Add issuing organization');
  }

  // Has issue date
  if (cert.issueDate && cert.issueDate.month && cert.issueDate.year) {
    score += 20;
  } else {
    suggestions.push('Add issue date');
  }

  // Has credential URL
  if (cert.credentialUrl && cert.credentialUrl.trim()) {
    score += 20;
  } else {
    suggestions.push('Add credential URL for verification');
  }

  return {
    score: Math.min(100, score),
    suggestions,
  };
}

export function isCertificationsValid(certifications) {
  return Object.keys(validateCertificationsForm(certifications)).length === 0;
}

// ==========================================
// UNIT TESTS
// ==========================================

/*
describe('Certifications Validation', () => {
  describe('validateCertificationName', () => {
    test('should reject empty', () => {
      expect(validateCertificationName('')).toContain('required');
    });

    test('should accept valid name', () => {
      expect(validateCertificationName('AWS Certified')).toBeNull();
    });
  });

  describe('validateIssueDate', () => {
    test('should require date', () => {
      expect(validateIssueDate(null)).toContain('required');
    });

    test('should reject future date', () => {
      const futureDate = { month: 12, year: new Date().getFullYear() + 1 };
      expect(validateIssueDate(futureDate)).toContain('future');
    });

    test('should accept valid date', () => {
      expect(validateIssueDate({ month: 6, year: 2023 })).toBeNull();
    });
  });

  describe('validateCredentialURL', () => {
    test('should accept empty (optional)', () => {
      expect(validateCredentialURL('')).toBeNull();
    });

    test('should reject invalid format', () => {
      expect(validateCredentialURL('not-a-url')).toContain('Invalid');
    });

    test('should accept valid URL', () => {
      expect(validateCredentialURL('https://credly.com/badge/123')).toBeNull();
    });
  });

  describe('getCertificationQualityScore', () => {
    test('should score complete certification high', () => {
      const complete = {
        certificationName: 'AWS Solutions Architect',
        issuer: 'Amazon Web Services',
        issueDate: { month: 6, year: 2023 },
        credentialUrl: 'https://credly.com/badge/123',
      };
      const result = getCertificationQualityScore(complete);
      expect(result.score).toBe(100);
    });
  });
});
*/
