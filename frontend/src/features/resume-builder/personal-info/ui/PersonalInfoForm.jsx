/**
 * @file features/resume-builder/personal-info/ui/PersonalInfoForm.jsx
 * @description Personal Info form - Step 1 (FINAL - WITH VALIDATION)
 * @author Nozibul Islam
 *
 * Architecture:
 * - Uses sub-components (SocialLinksSection, PhotoUpload)
 * - Uses validation from model/validation.js
 * - Uses sanitization from model/sanitizers.js
 * - Auto-save with debouncing
 *
 * Self-Review:
 * ✅ Readability: Clean, modular
 * ✅ Performance: Memoized, debounced
 * ✅ Security: XSS prevention via sanitizers
 * ✅ Best Practices: Separation of concerns
 * ✅ Potential Bugs: Null-safe
 * ✅ Memory Leaks: None
 */

'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import {
  updateCurrentResumeField,
  setIsSaving,
} from '@/shared/store/slices/resumeSlice';
import ResumeInput from '@/shared/components/atoms/resume/ResumeInput';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import SocialLinksSection from './SocialLinksSection';
import PhotoUpload from './PhotoUpload';
import { personalInfoValidationRules } from '../model/validation';
import { sanitizePersonalInfoForm } from '../model/sanitizers';
import { LIMITS } from '@/shared/lib/constants';
import logger from '@/shared/lib/logger';

/**
 * PersonalInfoForm Component
 * Step 1: Contact Information & Social Links
 */
function PersonalInfoForm() {
  const dispatch = useDispatch();
  const resumeData = useCurrentResumeData();

  // ==========================================
  // STATE
  // ==========================================
  const [formData, setFormData] = useState({
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isFormTouched, setIsFormTouched] = useState(false);

  // ==========================================
  // INITIALIZE FROM REDUX
  // ==========================================
  useEffect(() => {
    if (resumeData?.personalInfo) {
      setFormData(resumeData.personalInfo);
    }
  }, []);

  // ==========================================
  // VALIDATION HELPER
  // ==========================================
  const validateField = useCallback((name, value) => {
    const validator = personalInfoValidationRules[name];
    if (validator) {
      return validator(value);
    }
    return null;
  }, []);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      // Update form data
      setFormData((prev) => ({ ...prev, [name]: value }));
      setTouched((prev) => ({ ...prev, [name]: true }));
      setIsFormTouched(true);

      // Validate field
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  // ==========================================
  // HANDLE BLUR
  // ==========================================
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  // ==========================================
  // DEBOUNCED SAVE WITH SANITIZATION
  // ==========================================
  useEffect(() => {
    if (!isFormTouched) return;

    const timer = setTimeout(() => {
      logger.info('Saving personal info to Redux...');
      dispatch(setIsSaving(true));

      // ✅ SANITIZE before saving
      const sanitizedData = sanitizePersonalInfoForm(formData);

      dispatch(
        updateCurrentResumeField({
          field: 'personalInfo',
          value: sanitizedData,
        })
      );

      setTimeout(() => dispatch(setIsSaving(false)), 500);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData, isFormTouched, dispatch]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const toggleSocialLinks = useCallback(() => {
    setShowSocialLinks((prev) => !prev);
  }, []);

  const handlePhotoChange = useCallback((file) => {
    setProfilePhoto(file);
    logger.info('Photo selected:', file?.name);
  }, []);

  // ==========================================
  // VALIDATION STATUS
  // ==========================================
  const isValid = useCallback(() => {
    const requiredFields = ['fullName', 'jobTitle', 'email', 'phone'];
    const hasAllRequired = requiredFields.every(
      (field) => formData[field] && formData[field].trim()
    );
    const hasNoErrors = !Object.values(errors).some((error) => error);
    return hasAllRequired && hasNoErrors;
  }, [formData, errors]);

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
      {/* ATS GUIDELINES BANNER */}
      <ATSBanner title="ATS-Friendly Tips" tips={atsTips} />

      {/* PROFILE PHOTO */}
      <PhotoUpload onPhotoChange={handlePhotoChange} initialPhoto={null} />

      {/* REQUIRED CONTACT FIELDS */}
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
          placeholder="john.doe@gmail.com"
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

        {/* Location */}
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

      {/* SOCIAL LINKS SECTION */}
      <SocialLinksSection
        formData={formData}
        errors={errors}
        touched={touched}
        isExpanded={showSocialLinks}
        onToggle={toggleSocialLinks}
        handleChange={handleChange}
        handleBlur={handleBlur}
      />

      {/* VALIDATION STATUS */}
      {!isValid() && Object.keys(touched).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Please fill all required fields correctly to continue
          </p>
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {isValid() && Object.keys(touched).length > 0 && (
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
