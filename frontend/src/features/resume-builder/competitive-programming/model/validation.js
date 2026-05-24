/**
 * @file features/resume-builder/competitive-programming/model/validation.js
 * @description Validation rules for Competitive Programming
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * Synced with backend competitiveProgrammingSchema:
 * - platform: min(1) max(50) only — no whitelist (backend accepts any platform)
 * - problemsSolved: string max(20) — not a number field
 * - MAX_CP_PLATFORMS used (matches backend LIMITS)
 */

import { LIMITS } from '@/shared/lib/constants';

// ── Platform ──────────────────────────────────────────────────────────────────

export function validatePlatform(platform) {
  if (!platform || platform.trim() === '') return 'Platform is required';
  if (platform.length > 50) return 'Platform name cannot exceed 50 characters';
  return null;
}

// ── Problems solved ───────────────────────────────────────────────────────────

/**
 * Backend stores problemsSolved as String max(20).
 * Validate as string — do not coerce to Number.
 */
export function validateProblemsSolved(value) {
  if (!value || value.toString().trim() === '') return null;
  if (value.toString().length > 20) return 'Problems solved value is too long';
  return null;
}

// ── Profile URL ───────────────────────────────────────────────────────────────

export function validateProfileURL(url) {
  if (!url || url.trim() === '') return null;

  try {
    const { protocol } = new URL(url);
    if (!['http:', 'https:'].includes(protocol)) {
      return 'URL must start with http:// or https://';
    }
    return null;
  } catch {
    return 'Invalid URL format';
  }
}

// ── Badges ────────────────────────────────────────────────────────────────────

export function validateBadges(badges) {
  if (!Array.isArray(badges)) return 'Badges must be an array';
  if (badges.length > LIMITS.MAX_BADGES) {
    return `Maximum ${LIMITS.MAX_BADGES} badges allowed`;
  }
  if (badges.some((b) => !b || b.trim() === '')) {
    return 'Empty badges not allowed';
  }
  return null;
}

// ── Single CP profile ─────────────────────────────────────────────────────────

export function validateCPProfile(profile) {
  const errors = {};

  const platformError = validatePlatform(profile.platform);
  if (platformError) errors.platform = platformError;

  const problemsError = validateProblemsSolved(profile.problemsSolved);
  if (problemsError) errors.problemsSolved = problemsError;

  const badgesError = validateBadges(profile.badges || []);
  if (badgesError) errors.badges = badgesError;

  const urlError = validateProfileURL(profile.profileUrl);
  if (urlError) errors.profileUrl = urlError;

  return errors;
}

// ── All CP profiles ───────────────────────────────────────────────────────────

/**
 * Empty array is valid — backend accepts [].
 * Only structural and field-level errors are returned.
 */
export function validateCPForm(profiles) {
  if (!Array.isArray(profiles)) return { _form: 'Profiles must be an array' };

  if (profiles.length > LIMITS.MAX_CP_PLATFORMS) {
    return { _form: `Maximum ${LIMITS.MAX_CP_PLATFORMS} profiles allowed` };
  }

  const errors = {};
  profiles.forEach((profile, index) => {
    const profileErrors = validateCPProfile(profile);
    if (Object.keys(profileErrors).length > 0) errors[index] = profileErrors;
  });

  return errors;
}

export function isCPValid(profiles) {
  return Object.keys(validateCPForm(profiles)).length === 0;
}

// ── Quality score ─────────────────────────────────────────────────────────────

export function getCPQualityScore(profile) {
  let score = 0;
  const suggestions = [];

  if (profile.platform?.trim()) {
    score += 30;
  } else {
    suggestions.push('Select a platform');
  }

  if (profile.problemsSolved?.toString().trim()) {
    score += 20;
    const num = parseInt(profile.problemsSolved, 10);
    if (!isNaN(num)) {
      if (num >= 100) score += 10;
      if (num >= 500) score += 10;
    }
  } else {
    suggestions.push('Add problems solved count');
  }

  if (profile.badges?.length > 0) {
    score += 20;
  } else {
    suggestions.push('Add badges or achievements');
  }

  if (profile.profileUrl?.trim()) {
    score += 10;
  } else {
    suggestions.push('Add profile URL for verification');
  }

  return { score: Math.min(100, score), suggestions };
}
