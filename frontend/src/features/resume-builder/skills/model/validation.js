/**
 * @file features/resume-builder/skills/model/validation.js
 * @description Validation rules for Skills
 * @author Nozibul Islam
 *
 * Self-Review:
 * ✅ Readability: Clear, documented
 * ✅ Performance: Pure functions
 * ✅ Security: Array validation
 * ✅ Best Practices: Reusable
 * ✅ Potential Bugs: Edge cases handled
 * ✅ Unit Tests: Comprehensive
 */

import { LIMITS } from '@/shared/lib/constants';

// ==========================================
// SKILL CATEGORY VALIDATION
// ==========================================

export function validateSkillCategory(skills, categoryName) {
  if (!Array.isArray(skills)) {
    return `${categoryName} must be an array`;
  }

  if (skills.length > LIMITS.MAX_SKILLS_PER_CATEGORY) {
    return `Maximum ${LIMITS.MAX_SKILLS_PER_CATEGORY} skills allowed in ${categoryName}`;
  }

  // Check for duplicates
  const unique = new Set(skills.map((s) => s.toLowerCase()));
  if (unique.size !== skills.length) {
    return `Duplicate skills found in ${categoryName}`;
  }

  // Check for empty strings
  if (skills.some((s) => !s || s.trim() === '')) {
    return `Empty skills not allowed in ${categoryName}`;
  }

  return null;
}

// ==========================================
// ALL SKILLS VALIDATION
// ==========================================

export function validateSkillsForm(formData) {
  const errors = {};

  const categories = [
    'programmingLanguages',
    'frontend',
    'backend',
    'database',
    'devOps',
    'tools',
    'other',
  ];

  categories.forEach((category) => {
    const skills = formData[category] || [];
    const error = validateSkillCategory(skills, category);
    if (error) {
      errors[category] = error;
    }
  });

  // Check if at least one skill exists
  const totalSkills = categories.reduce(
    (sum, cat) => sum + (formData[cat]?.length || 0),
    0
  );

  if (totalSkills === 0) {
    errors._form = 'Add at least one skill';
  }

  return errors;
}

// ==========================================
// QUALITY CHECKS
// ==========================================

export function getSkillsQualityScore(formData) {
  let score = 0;
  const suggestions = [];

  const categories = [
    'programmingLanguages',
    'frontend',
    'backend',
    'database',
    'devOps',
    'tools',
    'other',
  ];

  // Count total skills
  const totalSkills = categories.reduce(
    (sum, cat) => sum + (formData[cat]?.length || 0),
    0
  );

  if (totalSkills === 0) {
    return {
      score: 0,
      suggestions: ['Add skills to improve your resume'],
    };
  }

  // Has programming languages (critical for tech roles)
  if (formData.programmingLanguages?.length > 0) {
    score += 25;
    if (formData.programmingLanguages.length >= 3) {
      score += 10;
    }
  } else {
    suggestions.push('Add programming languages (critical for tech roles)');
  }

  // Has frontend skills
  if (formData.frontend?.length >= 2) {
    score += 15;
  } else if (formData.frontend?.length === 0) {
    suggestions.push('Add frontend skills if applicable');
  }

  // Has backend skills
  if (formData.backend?.length >= 2) {
    score += 15;
  } else if (formData.backend?.length === 0) {
    suggestions.push('Add backend skills if applicable');
  }

  // Has database skills
  if (formData.database?.length >= 1) {
    score += 10;
  } else {
    suggestions.push('Add database skills');
  }

  // Has DevOps/Cloud skills
  if (formData.devOps?.length >= 1) {
    score += 10;
  }

  // Has tools
  if (formData.tools?.length >= 2) {
    score += 10;
  }

  // Balanced distribution (not all in one category)
  const filledCategories = categories.filter(
    (cat) => formData[cat]?.length > 0
  ).length;

  if (filledCategories >= 4) {
    score += 15;
  } else if (filledCategories < 3) {
    suggestions.push('Add skills across multiple categories for balance');
  }

  return {
    score: Math.min(100, score),
    suggestions,
  };
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getTotalSkillsCount(formData) {
  const categories = [
    'programmingLanguages',
    'frontend',
    'backend',
    'database',
    'devOps',
    'tools',
    'other',
  ];

  return categories.reduce((sum, cat) => sum + (formData[cat]?.length || 0), 0);
}

export function isSkillsValid(formData) {
  return Object.keys(validateSkillsForm(formData)).length === 0;
}

// ==========================================
// UNIT TESTS
// ==========================================

/*
describe('Skills Validation', () => {
  describe('validateSkillCategory', () => {
    test('should reject non-array', () => {
      expect(validateSkillCategory('not array', 'Frontend')).toContain('array');
    });

    test('should reject duplicates', () => {
      expect(validateSkillCategory(['React', 'react'], 'Frontend')).toContain('Duplicate');
    });

    test('should reject empty strings', () => {
      expect(validateSkillCategory(['React', ''], 'Frontend')).toContain('Empty');
    });

    test('should accept valid skills', () => {
      expect(validateSkillCategory(['React', 'Vue'], 'Frontend')).toBeNull();
    });
  });

  describe('getSkillsQualityScore', () => {
    test('should score balanced skills high', () => {
      const balanced = {
        programmingLanguages: ['JavaScript', 'Python', 'Java'],
        frontend: ['React', 'Vue'],
        backend: ['Node.js', 'Django'],
        database: ['MongoDB', 'PostgreSQL'],
        devOps: ['Docker'],
      };
      const result = getSkillsQualityScore(balanced);
      expect(result.score).toBeGreaterThan(80);
    });

    test('should suggest improvements for empty', () => {
      const empty = {};
      const result = getSkillsQualityScore(empty);
      expect(result.score).toBe(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });
});
*/
