/**
 * @file shared/hooks/useResumeForm.js
 * @description Reusable base form hook for all resume forms
 * @author Nozibul Islam
 *
 * Features:
 * - Generic form state management
 * - Debounced auto-save (500ms)
 * - Redux integration
 * - Input sanitization (XSS prevention)
 * - Validation helpers
 * - Error state management
 *
 * Usage:
 * const { formData, errors, touched, handleChange, handleBlur, isValid } =
 *   useResumeForm('personalInfo', initialData, validationRules);
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import {
  updateCurrentResumeField,
  setIsSaving,
} from '@/shared/store/slices/resumeSlice';
import logger from '@/shared/lib/logger';

/**
 * Base resume form hook
 * @param {string} fieldName - Redux field name (e.g., 'personalInfo', 'skills')
 * @param {object|array} initialData - Initial form data
 * @param {object} validationRules - Validation rules object
 * @returns {object} Form state and handlers
 */
export function useResumeForm(fieldName, initialData, validationRules = {}) {
  const dispatch = useDispatch();
  const resumeData = useCurrentResumeData();

  // ==========================================
  // STATE
  // ==========================================
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormTouched, setIsFormTouched] = useState(false);

  // ==========================================
  // INITIALIZE FROM REDUX (on mount)
  // ==========================================
  useEffect(() => {
    if (resumeData && resumeData[fieldName]) {
      setFormData(resumeData[fieldName]);
    }
  }, []); // Only on mount

  // ==========================================
  // SANITIZATION HELPER
  // ==========================================
  const sanitizeInput = useCallback((value) => {
    if (typeof value !== 'string') return value;

    // Remove dangerous HTML/JS
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  }, []);

  // ==========================================
  // VALIDATION HELPER
  // ==========================================
  const validateField = useCallback(
    (name, value) => {
      if (!validationRules[name]) return null;

      const rules = validationRules[name];

      // Required check
      if (rules.required && (!value || value.toString().trim() === '')) {
        return rules.requiredMessage || `${name} is required`;
      }

      // Min length
      if (rules.minLength && value.length < rules.minLength) {
        return `Minimum ${rules.minLength} characters required`;
      }

      // Max length
      if (rules.maxLength && value.length > rules.maxLength) {
        return `Maximum ${rules.maxLength} characters allowed`;
      }

      // Email validation
      if (rules.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Invalid email format';
        }
        // Check for fake domains
        if (value.includes('example.com') || value.includes('test.com')) {
          return 'Please use a real email address';
        }
      }

      // Phone validation
      if (rules.type === 'phone') {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
        if (!phoneRegex.test(value)) {
          return 'Invalid phone format (10-15 digits)';
        }
      }

      // URL validation
      if (rules.type === 'url' && value) {
        try {
          const url = new URL(value);
          if (!['http:', 'https:'].includes(url.protocol)) {
            return 'URL must start with http:// or https://';
          }
        } catch {
          return 'Invalid URL format';
        }
      }

      // Custom validator
      if (rules.validator && typeof rules.validator === 'function') {
        return rules.validator(value);
      }

      return null;
    },
    [validationRules]
  );

  // ==========================================
  // HANDLE CHANGE
  // ==========================================
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === 'checkbox' ? checked : value;

      // Sanitize string inputs
      const sanitizedValue =
        typeof fieldValue === 'string' ? sanitizeInput(fieldValue) : fieldValue;

      // Update form data
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));

      // Mark as touched
      setTouched((prev) => ({ ...prev, [name]: true }));
      setIsFormTouched(true);

      // Validate field
      const error = validateField(name, sanitizedValue);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [sanitizeInput, validateField]
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
  // DEBOUNCED REDUX UPDATE
  // ==========================================
  useEffect(() => {
    if (!isFormTouched) return;

    const timer = setTimeout(() => {
      logger.info(`Saving ${fieldName} to Redux...`);
      dispatch(setIsSaving(true));

      dispatch(
        updateCurrentResumeField({
          field: fieldName,
          value: formData,
        })
      );

      setTimeout(() => {
        dispatch(setIsSaving(false));
      }, 500);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [formData, fieldName, dispatch, isFormTouched]);

  // ==========================================
  // FORM VALIDATION STATE
  // ==========================================
  const isValid = useMemo(() => {
    // Check if all required fields are filled
    const requiredFieldNames = Object.keys(validationRules).filter(
      (key) => validationRules[key].required
    );

    const hasAllRequired = requiredFieldNames.every(
      (field) => formData[field] && formData[field].toString().trim() !== ''
    );

    // Check if no errors exist
    const hasNoErrors = !Object.values(errors).some((error) => error !== null);

    return hasAllRequired && hasNoErrors;
  }, [formData, errors, validationRules]);

  // ==========================================
  // MANUAL UPDATE (for complex fields)
  // ==========================================
  const updateField = useCallback(
    (name, value) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setTouched((prev) => ({ ...prev, [name]: true }));
      setIsFormTouched(true);

      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  // ==========================================
  // RESET FORM
  // ==========================================
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setIsFormTouched(false);
  }, [initialData]);

  // ==========================================
  // RETURN
  // ==========================================
  return {
    formData,
    errors,
    touched,
    isValid,
    isFormTouched,
    handleChange,
    handleBlur,
    updateField,
    resetForm,
    sanitizeInput,
    validateField,
  };
}

/**
 * Common validation rules (reusable)
 */
export const commonValidationRules = {
  email: {
    required: true,
    type: 'email',
    requiredMessage: 'Email is required',
  },
  phone: {
    required: true,
    type: 'phone',
    requiredMessage: 'Phone number is required',
  },
  url: {
    type: 'url',
  },
  required: (fieldName, maxLength = 100) => ({
    required: true,
    maxLength,
    requiredMessage: `${fieldName} is required`,
  }),
  optional: (maxLength = 100) => ({
    maxLength,
  }),
};
