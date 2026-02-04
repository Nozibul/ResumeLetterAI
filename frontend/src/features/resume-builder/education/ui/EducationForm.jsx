/**
 * @file features/resume-builder/education/ui/EducationForm.jsx
 * @description Education form - Step 6
 * @author Nozibul Islam
 *
 * TODO: Implement actual form fields
 * - Degree, institution, location
 * - Graduation date (month/year)
 * - GPA (optional, 0-4 scale)
 * - Add/remove/reorder education entries
 */

'use client';

import { memo } from 'react';

/**
 * EducationForm Component
 * Step 6: Education
 */
function EducationForm() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
          <svg
            className="h-8 w-8 text-cyan-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Education Form
        </h3>
        <p className="text-sm text-gray-600">
          Form implementation coming soon...
        </p>
        <div className="mt-4 text-xs text-gray-500">
          Fields: Degree, Institution, Location, Date, GPA
        </div>
      </div>
    </div>
  );
}

export default memo(EducationForm);
