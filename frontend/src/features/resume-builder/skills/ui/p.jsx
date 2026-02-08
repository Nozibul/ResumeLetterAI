/**
 * @file features/resume-builder/skills/ui/SkillsForm.jsx
 * @description Skills form - Step 5 (Reusable Pattern)
 * @author Nozibul Islam
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
 * Quality Checks:
 * ✅ All standards met
 */

'use client';

import { memo } from 'react';
import { useResumeForm } from '@/shared/hooks/useResumeForm';
import TagInput from '@/shared/components/atoms/resume/TagInput';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import { LIMITS, SKILLS_SUGGESTIONS } from '@/shared/lib/constants';

function SkillsForm() {
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

  const categories = [
    {
      name: 'programmingLanguages',
      label: 'Programming Languages',
      suggestions: SKILLS_SUGGESTIONS.programmingLanguages,
    },
    {
      name: 'frontend',
      label: 'Frontend',
      suggestions: SKILLS_SUGGESTIONS.frontend,
    },
    {
      name: 'backend',
      label: 'Backend',
      suggestions: SKILLS_SUGGESTIONS.backend,
    },
    {
      name: 'database',
      label: 'Database',
      suggestions: SKILLS_SUGGESTIONS.database,
    },
    {
      name: 'devOps',
      label: 'DevOps & Cloud',
      suggestions: SKILLS_SUGGESTIONS.devOps,
    },
    {
      name: 'tools',
      label: 'Tools & Platforms',
      suggestions: SKILLS_SUGGESTIONS.tools,
    },
    {
      name: 'other',
      label: 'Other Skills',
      suggestions: SKILLS_SUGGESTIONS.other,
    },
  ];

  const atsTips = [
    'List only skills you can confidently discuss in interviews',
    'Include both technical and soft skills relevant to the role',
    'Use industry-standard terms (React, not React.js)',
    'Prioritize skills mentioned in job descriptions',
    'Group similar skills together for easy scanning',
  ];

  return (
    <div className="space-y-6">
      <ATSBanner title="Skills Section Best Practices" tips={atsTips} />
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          💡 <strong>Tip:</strong> Focus on skills relevant to your target role.
          Quality over quantity - 5-10 strong skills per category is better than
          20 vague ones.
        </p>
      </div>
      <div className="space-y-6">
        {categories.map(({ name, label, suggestions }) => (
          <TagInput
            key={name}
            label={label}
            name={name}
            tags={formData[name] || []}
            onAdd={(skill) =>
              updateField(name, [...(formData[name] || []), skill])
            }
            onRemove={(skill) =>
              updateField(
                name,
                (formData[name] || []).filter((s) => s !== skill)
              )
            }
            suggestions={suggestions}
            maxTags={LIMITS.MAX_SKILLS_PER_CATEGORY}
            placeholder={`Add ${label.toLowerCase()} (press Enter)`}
          />
        ))}
      </div>
    </div>
  );
}

// export default memo(SkillsForm);
