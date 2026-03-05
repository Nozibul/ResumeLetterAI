/**
 * @file features/resume-builder/personal-info/ui/PersonalInfoForm.jsx
 * @description Personal Info form - Step 1
 * @author Nozibul Islam
 *
 * Uses shared useResumeForm hook for all state, save, and validation logic.
 * Component is responsible for UI only — no business logic here.
 */

'use client';

import { memo, useState, useCallback } from 'react';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import { useResumeForm } from '@/shared/hooks/useResumeForm';
import ResumeInput from '@/shared/components/atoms/resume/ResumeInput';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import SocialLinksSection from './SocialLinksSection';
import PhotoUpload from './PhotoUpload';
import { personalInfoValidationRules } from '../model/validation';
import { sanitizePersonalInfoForm } from '../model/sanitizers';
import { LIMITS } from '@/shared/lib/constants';
import logger from '@/shared/lib/logger';

// ==========================================
// CONSTANTS
// ==========================================
const INITIAL_FORM_DATA = {
  fullName: '',
  jobTitle: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  portfolio: '',
};

const ATS_TIPS = [
  'Use your real full name (no nicknames)',
  'Include professional email (avoid unprofessional handles)',
  'Add LinkedIn/GitHub for tech roles',
  'Phone format: +1 234 567 8900 or (123) 456-7890',
];

const REQUIRED_FIELDS = ['fullName', 'jobTitle', 'email', 'phone'];

/**
 * PersonalInfoForm Component
 * Step 1: Contact Information & Social Links
 */
function PersonalInfoForm() {
  const resumeData = useCurrentResumeData();

  // ==========================================
  // FORM HOOK
  // Single source of truth for form state, validation, and save logic.
  // isValid comes from the hook — no duplicate logic in this component.
  // ==========================================
  const { formData, errors, touched, isValid, handleChange, handleBlur } =
    useResumeForm({
      field: 'personalInfo',
      initialData: INITIAL_FORM_DATA,
      reduxData: resumeData?.personalInfo,
      requiredFields: REQUIRED_FIELDS,
      validationRules: personalInfoValidationRules,
      sanitize: sanitizePersonalInfoForm,
    });

  // ==========================================
  // LOCAL UI STATE
  // Only UI concerns live here — not form logic
  // ==========================================
  const [showSocialLinks, setShowSocialLinks] = useState(false);

  // ==========================================
  // HANDLERS
  // ==========================================
  const toggleSocialLinks = useCallback(() => {
    setShowSocialLinks((prev) => !prev);
  }, []);

  const handlePhotoChange = useCallback((file) => {
    logger.info('Photo selected:', file?.name);
  }, []);

  const hasTouchedAnyField = Object.keys(touched).length > 0;

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ATS GUIDELINES */}
      <ATSBanner title="ATS-Friendly Tips" tips={ATS_TIPS} />

      {/* PROFILE PHOTO */}
      <PhotoUpload onPhotoChange={handlePhotoChange} initialPhoto={null} />

      {/* CONTACT FIELDS */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Contact Information <span className="text-red-500">*</span>
        </h3>

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

        <ResumeInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="john.doe@gmail.com"
          required
          error={errors.email}
          touched={touched.email}
        />

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

      {/* SOCIAL LINKS */}
      <SocialLinksSection
        formData={formData}
        errors={errors}
        touched={touched}
        isExpanded={showSocialLinks}
        onToggle={toggleSocialLinks}
        handleChange={handleChange}
        handleBlur={handleBlur}
      />

      {/* VALIDATION MESSAGES — only visible after user interaction */}
      {hasTouchedAnyField && !isValid() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Please fill all required fields correctly to continue
          </p>
        </div>
      )}

      {hasTouchedAnyField && isValid() && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✓ All required fields are valid!
          </p>
        </div>
      )}
    </div>
  );
}

export default memo(PersonalInfoForm);
