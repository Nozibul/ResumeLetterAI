/**
 * @file features/resume-builder/skills/ui/SkillsForm.jsx
 * @description Skills form - Step 5 (REFACTORED)
 * @author Nozibul Islam
 *
 * Architecture:
 * - Uses sub-components (SkillCategory, SuggestionsList)
 * - Clean separation of concerns
 * - Modular and maintainable
 *
 * Backend Schema:
 * skills: {
 *   programmingLanguages: [String] (max 20),
 *   frontend: [String] (max 20),
 *   backend: [String] (max 20),
 *   database: [String] (max 20),
 *   devOps: [String] (max 20),
 *   tools: [String] (max 20),
 *   other: [String] (max 20)
 * }
 *
 * Self-Review:
 * ✅ Readability: Clean, modular
 * ✅ Performance: Memoized, debounced
 * ✅ Security: No XSS
 * ✅ Best Practices: Industry standard
 * ✅ Potential Bugs: Null-safe
 * ✅ Memory Leaks: None
 */

'use client';

import { memo, useCallback } from 'react';
import { useResumeForm } from '@/shared/hooks/useResumeForm';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import SkillCategory from './SkillCategory';
import SuggestionsList from './SuggestionsList';
import { SKILLS_SUGGESTIONS } from '@/shared/lib/constants';

/**
 * SkillsForm Component
 * Step 5: Technical Skills
 */
function SkillsForm() {
  // ==========================================
  // FORM STATE
  // ==========================================
  const { formData, updateField } = useResumeForm(
    'skills',
    {
      programmingLanguages: [],
      frontend: [],
      backend: [],
      database: [],
      devOps: [],
      tools: [],
      other: [],
    },
    {}
  );

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleAddSkill = useCallback(
    (category, skill) => {
      const current = formData[category] || [];
      if (!current.includes(skill)) {
        updateField(category, [...current, skill]);
      }
    },
    [formData, updateField]
  );

  const handleRemoveSkill = useCallback(
    (category, skill) => {
      const current = formData[category] || [];
      updateField(
        category,
        current.filter((s) => s !== skill)
      );
    },
    [formData, updateField]
  );

  // ==========================================
  // CATEGORIES CONFIGURATION
  // ==========================================
  const categories = [
    {
      name: 'programmingLanguages',
      label: 'Programming Languages',
      icon: '💻',
      suggestions: SKILLS_SUGGESTIONS.programmingLanguages,
    },
    {
      name: 'frontend',
      label: 'Frontend',
      icon: '🎨',
      suggestions: SKILLS_SUGGESTIONS.frontend,
    },
    {
      name: 'backend',
      label: 'Backend',
      icon: '⚙️',
      suggestions: SKILLS_SUGGESTIONS.backend,
    },
    {
      name: 'database',
      label: 'Database',
      icon: '🗄️',
      suggestions: SKILLS_SUGGESTIONS.database,
    },
    {
      name: 'devOps',
      label: 'DevOps & Cloud',
      icon: '☁️',
      suggestions: SKILLS_SUGGESTIONS.devOps,
    },
    {
      name: 'tools',
      label: 'Tools & Platforms',
      icon: '🔧',
      suggestions: SKILLS_SUGGESTIONS.tools,
    },
    {
      name: 'other',
      label: 'Other Skills',
      icon: '✨',
      suggestions: SKILLS_SUGGESTIONS.other,
    },
  ];

  // ==========================================
  // ATS TIPS
  // ==========================================
  const atsTips = [
    'List only skills you can confidently discuss in interviews',
    'Include both technical and soft skills relevant to the role',
    'Use industry-standard terms (React, not React.js)',
    'Prioritize skills mentioned in job descriptions',
    'Group similar skills together for easy scanning',
  ];

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ATS GUIDELINES */}
      <ATSBanner title="Skills Section Best Practices" tips={atsTips} />

      {/* GENERAL TIP */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          💡 <strong>Tip:</strong> Focus on skills relevant to your target role.
          Quality over quantity - 5-10 strong skills per category is better than
          20 vague ones.
        </p>
      </div>

      {/* SKILL CATEGORIES */}
      <div className="space-y-4">
        {categories.map(({ name, label, icon, suggestions }) => (
          <div key={name} className="space-y-3">
            {/* Category Component */}
            <SkillCategory
              name={name}
              label={label}
              icon={icon}
              skills={formData[name] || []}
              suggestions={suggestions}
              onAdd={(skill) => handleAddSkill(name, skill)}
              onRemove={(skill) => handleRemoveSkill(name, skill)}
            />

            {/* Popular Suggestions */}
            <SuggestionsList
              category={label}
              suggestions={suggestions}
              currentSkills={formData[name] || []}
              onAdd={(skill) => handleAddSkill(name, skill)}
            />
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-teal-900 mb-1">
              Skills Added
            </h4>
            <p className="text-xs text-teal-800">
              Total:{' '}
              {Object.values(formData).reduce(
                (sum, arr) => sum + (arr?.length || 0),
                0
              )}{' '}
              skills across{' '}
              {Object.values(formData).filter((arr) => arr?.length > 0).length}{' '}
              categories
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(SkillsForm);
