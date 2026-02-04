/**
 * @file features/resume-builder/skills/ui/SkillsForm.jsx
 * @description Skills form - Step 5
 * @author Nozibul Islam
 *
 * TODO: Implement actual form fields
 * - 7 skill categories (Programming, Frontend, Backend, Database, DevOps, Tools, Other)
 * - Tag input for each category
 * - Skill suggestions (click to add)
 * - Max 20 skills per category
 */

'use client';

import { memo } from 'react';

/**
 * SkillsForm Component
 * Step 5: Technical Skills
 */
function SkillsForm() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <svg
            className="h-8 w-8 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Skills Form
        </h3>
        <p className="text-sm text-gray-600">
          Form implementation coming soon...
        </p>
        <div className="mt-4 text-xs text-gray-500">
          Categories: Programming, Frontend, Backend, Database, DevOps, Tools,
          Other
        </div>
      </div>
    </div>
  );
}

export default memo(SkillsForm);
