/**
 * @file features/resume-builder/personal-info/ui/PersonalInfoForm.jsx
 * @description Personal Info form - Step 1
 * @author Nozibul Islam
 *
 * TODO: Implement actual form fields
 * - Full name, job title, email, phone, location
 * - Social links (LinkedIn, GitHub, Portfolio, LeetCode)
 * - Photo upload (optional with ATS warning)
 */

'use client';

import { memo } from 'react';

/**
 * PersonalInfoForm Component
 * Step 1: Personal Information
 */
function PersonalInfoForm() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg
            className="h-8 w-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Personal Info Form
        </h3>
        <p className="text-sm text-gray-600">
          Form implementation coming soon...
        </p>
        <div className="mt-4 text-xs text-gray-500">
          Fields: Name, Title, Email, Phone, Location, Links
        </div>
      </div>
    </div>
  );
}

export default memo(PersonalInfoForm);
