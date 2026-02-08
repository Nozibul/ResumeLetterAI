/**
 * @file features/resume-builder/personal-info/ui/PersonalInfoForm.jsx
 * @description Personal Info form - Step 1
 * @author Nozibul Islam
 *
 * Architecture:
 * - Uses useResumeForm hook (reusable base logic)
 * - Uses atomic components (ResumeInput, ATSBanner)
 * - Follows FSD + Atomic Design principles
 * - Business logic isolated from UI
 *
 * Backend Schema Match:
 * personalInfo: {
 *   fullName: String (required, max 100)
 *   jobTitle: String (required, max 100)
 *   email: String (required, validated)
 *   phone: String (required, 10-15 digits)
 *   location: String (optional, max 100)
 *   linkedin: String (optional, URL)
 *   github: String (optional, URL)
 *   portfolio: String (optional, URL)
 *   leetcode: String (optional, URL)
 * }
 */

'use client';

import { memo, useState } from 'react';
import {
  useResumeForm,
  commonValidationRules,
} from '@/shared/hooks/useResumeForm';
import ResumeInput from '@/shared/components/atoms/resume/ResumeInput';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import { LIMITS } from '@/shared/lib/constants';

/**
 * PersonalInfoForm Component
 * Step 1: Contact Information & Social Links
 */
function PersonalInfoForm() {
  // ==========================================
  // INITIAL DATA
  // ==========================================
  const initialData = {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    leetcode: '',
  };

  // ==========================================
  // VALIDATION RULES
  // ==========================================
  const validationRules = {
    fullName: commonValidationRules.required(
      'Full Name',
      LIMITS.TITLE_MAX_LENGTH
    ),
    jobTitle: commonValidationRules.required(
      'Job Title',
      LIMITS.TITLE_MAX_LENGTH
    ),
    email: commonValidationRules.email,
    phone: commonValidationRules.phone,
    location: commonValidationRules.optional(LIMITS.TITLE_MAX_LENGTH),
    linkedin: commonValidationRules.url,
    github: commonValidationRules.url,
    portfolio: commonValidationRules.url,
    leetcode: commonValidationRules.url,
  };

  // ==========================================
  // USE REUSABLE HOOK
  // ==========================================
  const { formData, errors, touched, isValid, handleChange, handleBlur } =
    useResumeForm('personalInfo', initialData, validationRules);

  // ==========================================
  // LOCAL STATE (UI only)
  // ==========================================
  const [showSocialLinks, setShowSocialLinks] = useState(false);

  // ==========================================
  // ATS TIPS
  // ==========================================
  const atsTips = [
    'Use your real full name (no nicknames)',
    'Include professional email (avoid unprofessional handles)',
    'Add LinkedIn/GitHub for tech roles',
    'Phone format: +1 234 567 8900 or (123) 456-7890',
  ];

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ATS GUIDELINES */}
      <ATSBanner title="ATS-Friendly Tips" tips={atsTips} />

      {/* REQUIRED FIELDS */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Contact Information <span className="text-red-500">*</span>
        </h3>

        {/* Full Name */}
        <ResumeInput
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="John Doe"
          required
          maxLength={LIMITS.TITLE_MAX_LENGTH}
          showCounter
          error={errors.fullName}
          touched={touched.fullName}
        />

        {/* Job Title */}
        <ResumeInput
          label="Job Title"
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Software Engineer"
          required
          maxLength={LIMITS.TITLE_MAX_LENGTH}
          showCounter
          error={errors.jobTitle}
          touched={touched.jobTitle}
        />

        {/* Email */}
        <ResumeInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="john.doe@example.com"
          required
          error={errors.email}
          touched={touched.email}
        />

        {/* Phone */}
        <ResumeInput
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="+1 (555) 123-4567"
          required
          error={errors.phone}
          touched={touched.phone}
          helperText="Format: +1 234 567 8900 or (123) 456-7890"
        />

        {/* Location (Optional) */}
        <ResumeInput
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="San Francisco, CA"
          maxLength={LIMITS.TITLE_MAX_LENGTH}
          showCounter
          error={errors.location}
          touched={touched.location}
          helperText="City, State or City, Country"
        />
      </div>

      {/* SOCIAL LINKS (Collapsible) */}
      <div className="border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => setShowSocialLinks(!showSocialLinks)}
          className="flex items-center justify-between w-full text-left focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            Social Links{' '}
            <span className="text-gray-400 text-sm font-normal">
              (Optional but recommended for IT)
            </span>
          </h3>
          <svg
            className={`h-5 w-5 text-gray-500 transition-transform ${
              showSocialLinks ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showSocialLinks && (
          <div className="mt-4 space-y-4 animate-fadeInUp">
            {/* LinkedIn */}
            <ResumeInput
              label="LinkedIn Profile"
              name="linkedin"
              type="url"
              value={formData.linkedin}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://linkedin.com/in/johndoe"
              error={errors.linkedin}
              touched={touched.linkedin}
            />

            {/* GitHub */}
            <ResumeInput
              label="GitHub Profile"
              name="github"
              type="url"
              value={formData.github}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://github.com/johndoe"
              error={errors.github}
              touched={touched.github}
            />

            {/* Portfolio */}
            <ResumeInput
              label="Portfolio Website"
              name="portfolio"
              type="url"
              value={formData.portfolio}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://johndoe.com"
              error={errors.portfolio}
              touched={touched.portfolio}
            />

            {/* LeetCode */}
            <ResumeInput
              label="LeetCode Profile"
              name="leetcode"
              type="url"
              value={formData.leetcode}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://leetcode.com/johndoe"
              error={errors.leetcode}
              touched={touched.leetcode}
            />
          </div>
        )}
      </div>

      {/* VALIDATION STATUS */}
      {!isValid && Object.keys(touched).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Please fill all required fields correctly to continue
          </p>
        </div>
      )}
    </div>
  );
}

// export default memo(PersonalInfoForm);
