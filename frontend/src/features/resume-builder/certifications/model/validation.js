/**
 * @file features/resume-builder/certifications/model/validation.js
 * @description Validation rules for Certifications
 * @author Nozibul Islam
 * @version 2.1.0
 *
 * Synced with backend certificationSchema:
 * - issuer is optional (backend: default(''))
 * - future issue dates allowed (backend has no restriction)
 * - unused isKnownPlatform variable removed from validateCredentialURL
 * - validateIssueDate: removed unused currentYear variable
 */

import { LIMITS } from '@/shared/lib/constants';

// ── Certification name ────────────────────────────────────────────────────────

export function validateCertificationName(name) {
  if (!name || name.trim() === '') return 'Certification name is required';
  if (name.length > LIMITS.TITLE_MAX_LENGTH)
    return `Certification name cannot exceed ${LIMITS.TITLE_MAX_LENGTH} characters`;
  if (/^\s+$/.test(name)) return 'Certification name cannot be only whitespace';
  return null;
}

// ── Issuer ────────────────────────────────────────────────────────────────────

/**
 * Optional — backend certificationSchema: issuer: default('')
 * Only validates length if provided.
 */
export function validateIssuer(issuer) {
  if (!issuer || issuer.trim() === '') return null;
  if (issuer.length > LIMITS.TITLE_MAX_LENGTH)
    return `Issuer cannot exceed ${LIMITS.TITLE_MAX_LENGTH} characters`;
  return null;
}

// ── Issue date ────────────────────────────────────────────────────────────────

/**
 * Backend allows any date in range 1950–2100.
 * Future dates are valid (upcoming certifications).
 * No currentYear variable needed — range is static (1950–2100).
 */
export function validateIssueDate(issueDate) {
  if (!issueDate?.month || !issueDate?.year) return 'Issue date is required';

  const { month, year } = issueDate;
  if (month < 1 || month > 12) return 'Invalid month';
  if (year < 1950 || year > 2100) return 'Invalid year';

  return null;
}

// ── Credential URL ────────────────────────────────────────────────────────────

export function validateCredentialURL(url) {
  if (!url || url.trim() === '') return null;
  try {
    const { protocol } = new URL(url);
    if (!['http:', 'https:'].includes(protocol))
      return 'URL must start with http:// or https://';
    return null;
  } catch {
    return 'Invalid URL format';
  }
}

// ── Single certification ──────────────────────────────────────────────────────

export function validateCertification(cert) {
  const errors = {};

  const nameError = validateCertificationName(cert.certificationName);
  if (nameError) errors.certificationName = nameError;

  const issuerError = validateIssuer(cert.issuer);
  if (issuerError) errors.issuer = issuerError;

  const dateError = validateIssueDate(cert.issueDate);
  if (dateError) errors.issueDate = dateError;

  const urlError = validateCredentialURL(cert.credentialUrl);
  if (urlError) errors.credentialUrl = urlError;

  return errors;
}

// ── All certifications ────────────────────────────────────────────────────────

/**
 * Empty array is valid — backend accepts [].
 */
export function validateCertificationsForm(certifications) {
  if (!Array.isArray(certifications))
    return { _form: 'Certifications must be an array' };

  if (certifications.length > LIMITS.MAX_CERTIFICATIONS) {
    return {
      _form: `Maximum ${LIMITS.MAX_CERTIFICATIONS} certifications allowed`,
    };
  }

  const errors = {};
  certifications.forEach((cert, index) => {
    const certErrors = validateCertification(cert);
    if (Object.keys(certErrors).length > 0) errors[index] = certErrors;
  });

  return errors;
}

export function isCertificationsValid(certifications) {
  return Object.keys(validateCertificationsForm(certifications)).length === 0;
}

// ── Quality score ─────────────────────────────────────────────────────────────

export function getCertificationQualityScore(cert) {
  let score = 0;
  const suggestions = [];

  if (cert.certificationName?.trim()) {
    score += 30;
  } else {
    suggestions.push('Add certification name');
  }

  if (cert.issuer?.trim()) {
    score += 30;
  } else {
    suggestions.push('Add issuing organization');
  }

  if (cert.issueDate?.month && cert.issueDate?.year) {
    score += 20;
  } else {
    suggestions.push('Add issue date');
  }

  if (cert.credentialUrl?.trim()) {
    score += 20;
  } else {
    suggestions.push('Add credential URL for verification');
  }

  return { score: Math.min(100, score), suggestions };
}
