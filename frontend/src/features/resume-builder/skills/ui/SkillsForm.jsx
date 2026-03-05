/**
 * @file features/resume-builder/skills/ui/SkillsForm.jsx
 * @description Skills form - Step 5
 * @author Nozibul Islam
 *
 * Refactored to use shared useResumeForm hook.
 * All init, save logic lives in the hook.
 * Component is responsible for UI only.
 */

'use client';

import { memo, useCallback, useMemo } from 'react';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import { useResumeForm } from '@/shared/hooks/useResumeForm';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import SkillCategory from './SkillCategory';
import SuggestionsList from './SuggestionsList';
import { validateSkillsForm, getSkillsQualityScore } from '../model/validation';
import { SKILLS_SUGGESTIONS } from '@/shared/lib/constants';

// ==========================================
// CONSTANTS
// Defined outside component — stable reference, no re-creation on render
// ==========================================
const INITIAL_FORM_DATA = {
  programmingLanguages: [],
  frontend: [],
  backend: [],
  database: [],
  devOps: [],
  tools: [],
  other: [],
};

const ATS_TIPS = [
  'Include both technical and soft skills',
  'Use industry-standard terminology (React, not React.js)',
  'List programming languages you actively use',
  'Separate frontend, backend, and DevOps skills',
  'Keep skill names consistent (PostgreSQL, not Postgres)',
];

const SKILL_CATEGORIES = [
  { name: 'programmingLanguages', label: 'Programming Languages', icon: '💻' },
  { name: 'frontend', label: 'Frontend Development', icon: '🎨' },
  { name: 'backend', label: 'Backend Development', icon: '⚙️' },
  { name: 'database', label: 'Databases & Data', icon: '🗄️' },
  { name: 'devOps', label: 'DevOps & Cloud', icon: '☁️' },
  { name: 'tools', label: 'Tools & Technologies', icon: '🔧' },
  { name: 'other', label: 'Other Skills', icon: '✨' },
];

/**
 * Custom hasDataCheck for skills:
 * At least one category must have actual skills.
 * Prevents initializing from { programmingLanguages: [], frontend: [], ... }
 */
function skillsHasDataCheck(data) {
  return Object.values(data).some((v) => Array.isArray(v) && v.length > 0);
}

/**
 * SkillsForm Component
 * Step 5: Skills
 */
function SkillsForm() {
  const resumeData = useCurrentResumeData();

  // ==========================================
  // FORM HOOK
  // hasDataCheck: at least one skill category must be non-empty
  // Prevents {} or all-empty-array data from triggering initialization
  // Merge with INITIAL_FORM_DATA ensures all category keys always exist
  // No requiredFields — skills section is optional
  // ==========================================
  const { formData, updateField } = useResumeForm({
    field: 'skills',
    initialData: INITIAL_FORM_DATA,
    reduxData: resumeData?.skills
      ? { ...INITIAL_FORM_DATA, ...resumeData.skills }
      : undefined,
    hasDataCheck: skillsHasDataCheck,
  });

  // ==========================================
  // VALIDATION & QUALITY SCORE
  // Derived from formData — no separate state needed
  // useMemo — only recomputes when formData changes
  // ==========================================
  const errors = useMemo(() => validateSkillsForm(formData), [formData]);
  const qualityScore = useMemo(
    () => getSkillsQualityScore(formData),
    [formData]
  );

  // ==========================================
  // DERIVED VALUES
  // ==========================================
  const totalSkills = useMemo(
    () =>
      Object.values(formData).reduce(
        (total, skills) => total + (skills?.length || 0),
        0
      ),
    [formData]
  );

  const categoriesWithSkills = useMemo(
    () => Object.values(formData).filter((skills) => skills?.length > 0).length,
    [formData]
  );

  // ==========================================
  // HANDLERS
  // updateField from hook handles setFormData + setIsFormTouched
  // ==========================================
  const handleAddSkill = useCallback(
    (category, skill) => {
      const currentSkills = formData[category] || [];
      if (currentSkills.includes(skill)) return;
      updateField(category, [...currentSkills, skill]);
    },
    [formData, updateField]
  );

  const handleRemoveSkill = useCallback(
    (category, skill) => {
      const currentSkills = formData[category] || [];
      updateField(
        category,
        currentSkills.filter((s) => s !== skill)
      );
    },
    [formData, updateField]
  );

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ATS GUIDELINES */}
      <ATSBanner title="Skills Section Best Practices" tips={ATS_TIPS} />

      {/* STATS */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {totalSkills} skills across {categoriesWithSkills} categories
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Aim for 15-25 relevant skills for best results
            </p>
          </div>

          {qualityScore && (
            <div className="text-right">
              <div className="text-2xl font-bold text-teal-600">
                {qualityScore.score}%
              </div>
              <p className="text-xs text-gray-600">Quality Score</p>
            </div>
          )}
        </div>
      </div>

      {/* VALIDATION ERRORS */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-800 mb-2">
            ⚠️ Validation Issues:
          </p>
          <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* QUALITY SUGGESTIONS */}
      {qualityScore?.suggestions?.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-teal-800 mb-2">
            💡 Suggestions to improve:
          </p>
          <ul className="text-xs text-teal-700 space-y-1 list-disc list-inside">
            {qualityScore.suggestions.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* POPULAR SKILLS SUGGESTIONS */}
      {Object.entries(SKILLS_SUGGESTIONS).map(([category, suggestions]) => (
        <SuggestionsList
          key={category}
          category={category}
          suggestions={suggestions || []}
          currentSkills={formData[category] || []}
          onAdd={(skill) => handleAddSkill(category, skill)}
        />
      ))}

      {/* SKILL CATEGORIES */}
      <div className="space-y-4">
        {SKILL_CATEGORIES.map(({ name, label, icon }) => (
          <SkillCategory
            key={name}
            name={name}
            label={label}
            icon={icon}
            skills={formData[name] || []}
            onAdd={(skill) => handleAddSkill(name, skill)}
            onRemove={(skill) => handleRemoveSkill(name, skill)}
            suggestions={SKILLS_SUGGESTIONS[name] || []}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(SkillsForm);
