/**
 * @file features/resume-builder/projects/ui/ProjectsForm.jsx
 * @description Projects form - Step 4
 * @author Nozibul Islam
 *
 * TODO: Implement actual form fields
 * - Project name
 * - Tech stack (tags input)
 * - Description
 * - Live URL, Source code URL
 * - Highlights (bullet points)
 * - Add/remove/reorder projects
 */

'use client';

import { memo } from 'react';

/**
 * ProjectsForm Component
 * Step 4: Projects
 */
function ProjectsForm() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
          <svg
            className="h-8 w-8 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Projects Form
        </h3>
        <p className="text-sm text-gray-600">
          Form implementation coming soon...
        </p>
        <div className="mt-4 text-xs text-gray-500">
          Fields: Name, Tech Stack, Description, URLs, Highlights
        </div>
      </div>
    </div>
  );
}

export default memo(ProjectsForm);
