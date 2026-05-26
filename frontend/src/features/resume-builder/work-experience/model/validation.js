/**
 * @file features/resume-builder/work-experience/model/validation.js
 * @description Validation rules for Work Experience
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * Synced with backend workExperienceSchema + pre-save middleware:
 * - Empty array no longer an error (backend default: [])
 * - Empty responsibilities no longer an error (backend default: [])
 * - endDate check uses endDate?.year (mirrors backend pre-save logic)
 */

import { LIMITS } from '@/shared/lib/constants';

// ── Date range ────────────────────────────────────────────────────────────────

/**
 * Mirrors backend pre-save middleware:
 *   - currentlyWorking + endDate.year → invalid
 *   - !currentlyWorking + !endDate.year → invalid
 *   - endDate before startDate → invalid
 */
export function validateDateRange(startDate, endDate, currentlyWorking) {
  if (!startDate?.month || !startDate?.year) return 'Start date is required';

  if (currentlyWorking && endDate?.year) {
    return 'Cannot have end date while currently working';
  }

  if (!currentlyWorking && !endDate?.year) {
    return 'End date is required when not currently working';
  }

  if (endDate?.year && endDate?.month && startDate?.year && startDate?.month) {
    const start = startDate.year * 12 + startDate.month;
    const end = endDate.year * 12 + endDate.month;
    if (end < start) return 'End date must be after start date';
  }

  return null;
}

// ── Responsibilities ──────────────────────────────────────────────────────────

/**
 * Empty array is valid — backend accepts [].
 * Only structural and length errors are returned.
 */
export function validateResponsibilities(responsibilities) {
  if (!Array.isArray(responsibilities))
    return 'Responsibilities must be an array';

  if (responsibilities.length > LIMITS.MAX_RESPONSIBILITIES) {
    return `Maximum ${LIMITS.MAX_RESPONSIBILITIES} responsibilities allowed`;
  }

  for (let i = 0; i < responsibilities.length; i++) {
    if (responsibilities[i]?.length > 500) {
      return `Responsibility ${i + 1} exceeds 500 characters`;
    }
  }

  return null;
}

// ── Single experience ─────────────────────────────────────────────────────────

export function validateExperience(experience) {
  const errors = {};

  if (!experience.jobTitle?.trim()) {
    errors.jobTitle = 'Job title is required';
  } else if (experience.jobTitle.length > LIMITS.TITLE_MAX_LENGTH) {
    errors.jobTitle = `Job title cannot exceed ${LIMITS.TITLE_MAX_LENGTH} characters`;
  }

  if (!experience.company?.trim()) {
    errors.company = 'Company is required';
  } else if (experience.company.length > LIMITS.TITLE_MAX_LENGTH) {
    errors.company = `Company cannot exceed ${LIMITS.TITLE_MAX_LENGTH} characters`;
  }

  if (experience.location?.length > LIMITS.TITLE_MAX_LENGTH) {
    errors.location = `Location cannot exceed ${LIMITS.TITLE_MAX_LENGTH} characters`;
  }

  const dateError = validateDateRange(
    experience.startDate,
    experience.endDate,
    experience.currentlyWorking
  );
  if (dateError) errors.dateRange = dateError;

  const respError = validateResponsibilities(experience.responsibilities);
  if (respError) errors.responsibilities = respError;

  return errors;
}

// ── All experiences ───────────────────────────────────────────────────────────

/**
 * Empty array is valid — backend accepts [].
 */
export function validateWorkExperienceForm(experiences) {
  if (!Array.isArray(experiences)) {
    return { _form: 'Work experience must be an array' };
  }

  if (experiences.length > LIMITS.MAX_WORK_EXPERIENCES) {
    return {
      _form: `Maximum ${LIMITS.MAX_WORK_EXPERIENCES} experiences allowed`,
    };
  }

  const errors = {};
  experiences.forEach((exp, index) => {
    const expErrors = validateExperience(exp);
    if (Object.keys(expErrors).length > 0) errors[index] = expErrors;
  });

  return errors;
}

export function isWorkExperienceValid(experiences) {
  return Object.keys(validateWorkExperienceForm(experiences)).length === 0;
}

// ── Quality score ─────────────────────────────────────────────────────────────

export function getExperienceQualityScore(experience) {
  let score = 0;
  const suggestions = [];

  if (experience.jobTitle?.trim()) {
    score += 20;
  } else {
    suggestions.push('Add a job title');
  }

  if (experience.company?.trim()) {
    score += 20;
  } else {
    suggestions.push('Add a company name');
  }

  if (experience.location?.trim()) score += 10;

  if (experience.startDate?.month && experience.startDate?.year) {
    score += 15;
    if (
      experience.currentlyWorking ||
      (experience.endDate?.month && experience.endDate?.year)
    ) {
      score += 10;
    }
  } else {
    suggestions.push('Add start date');
  }

  if (experience.responsibilities?.length > 0) {
    const valid = experience.responsibilities.filter((r) => r?.trim());

    if (valid.length >= 3) {
      score += 25;
    } else if (valid.length >= 1) {
      score += 15;
      suggestions.push('Add 3-5 responsibilities for best results');
    } else {
      suggestions.push('Add key responsibilities');
    }

    const actionVerbs = [
      'led',
      'developed',
      'managed',
      'built',
      'designed',
      'implemented',
    ];
    const hasActionVerbs = valid.some((r) =>
      actionVerbs.some((v) => r.toLowerCase().includes(v))
    );
    if (!hasActionVerbs) {
      suggestions.push(
        'Start responsibilities with action verbs (Led, Developed, Managed)'
      );
    }

    const hasMetrics = valid.some((r) => /\d+[\+%]?/.test(r));
    if (!hasMetrics) {
      suggestions.push(
        'Add quantifiable metrics (reduced by 30%, managed $2M)'
      );
    }
  } else {
    suggestions.push('Add key responsibilities');
  }

  return { score: Math.min(100, score), suggestions };
}
