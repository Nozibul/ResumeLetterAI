/**
 * @file features/resume-builder/work-experience/ui/WorkExperienceForm.jsx
 * @description Work Experience form - Step 3
 * @author Nozibul Islam
 *
 * TODO: Implement actual form fields
 * - Job title, company, location
 * - Start/end dates (month/year picker)
 * - Currently working checkbox
 * - Responsibilities list (bullet points)
 * - Add/remove/reorder experiences
 */

'use client';

import { memo } from 'react';

/**
 * WorkExperienceForm Component
 * Step 3: Work Experience
 */
function WorkExperienceForm() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <svg
            className="h-8 w-8 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Work Experience Form
        </h3>
        <p className="text-sm text-gray-600">
          Form implementation coming soon...
        </p>
        <div className="mt-4 text-xs text-gray-500">
          Fields: Job Title, Company, Dates, Responsibilities
        </div>
      </div>
    </div>
  );
}

export default memo(WorkExperienceForm);
