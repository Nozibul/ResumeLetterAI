/**
 * @file shared/hooks/useResumeForm.js
 * @description Reusable base hook for all resume builder forms
 * @author Nozibul Islam
 *
 * ✅ One-time initialization from Redux (useRef — no loop, no stale closure)
 * ✅ Empty object guard — {} does not trigger initialization
 * ✅ hasDataCheck — custom check for complex data shapes (e.g. skills arrays)
 * ✅ isFormTouched guard — no save triggered on mount
 * ✅ hasData guard — no save if all fields are empty
 * ✅ Debounced auto-save to Redux (500ms)
 * ✅ No nested setTimeout — no memory leak on unmount
 * ✅ Optional sanitization before saving (XSS prevention)
 * ✅ Field-level validation (function-based or object-based rules)
 * ✅ isValid returned from hook — no duplicate logic in components
 * ✅ Logout / re-login safe — ref resets automatically on unmount
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  updateCurrentResumeField,
  setIsSaving,
} from '@/shared/store/slices/resumeSlice';
import logger from '@/shared/lib/logger';

/**
 * Default data check — works for standard object-based forms
 * Returns true if reduxData exists and has at least one key
 */
function defaultHasDataCheck(data) {
  return !!data && Object.keys(data).length > 0;
}

/**
 * @param {Object}   options
 * @param {string}   options.field             - Redux field key
 * @param {Object}   options.initialData       - Empty initial form state
 * @param {Object}   options.reduxData         - resumeData?.personalInfo etc.
 * @param {Function} [options.hasDataCheck]    - Custom fn: (data) => boolean
 **/
export function useResumeForm({
  field,
  initialData,
  reduxData,
  hasDataCheck = defaultHasDataCheck,
  requiredFields = [],
  validationRules = {},
  sanitize,
}) {
  const dispatch = useDispatch();

  // ==========================================
  // STATE
  // ==========================================
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormTouched, setIsFormTouched] = useState(false);

  // ==========================================
  // REFS
  // useRef does not trigger re-renders — no stale closure risk
  // Resets automatically on component unmount — logout/re-login safe
  // ==========================================
  const hasInitialized = useRef(false);

  // ==========================================
  // INITIALIZE FROM REDUX — runs only once
  //
  // Uses hasDataCheck to decide if reduxData is worth initializing from.
  // Default check: object must exist and have at least one key.
  // Override hasDataCheck for special cases:
  //   - skills: needs at least one non-empty array
  //   - nested objects: custom deep check
  // ==========================================
  useEffect(() => {
    if (hasInitialized.current) return;
    if (!reduxData || !hasDataCheck(reduxData)) return;

    setFormData(reduxData);
    hasInitialized.current = true;
    logger.info(`[useResumeForm] ${field} initialized from Redux`);
  }, [reduxData]);

  // ==========================================
  // VALIDATION HELPER
  // Supports both:
  //   function-based: validationRules[name] = (value) => error | null
  //   object-based:   { required: true, minLength: 2, type: 'email' }
  // ==========================================
  const validateField = useCallback(
    (name, value) => {
      const rule = validationRules[name];
      if (!rule) return null;

      if (typeof rule === 'function') {
        return rule(value);
      }

      if (typeof rule === 'object') {
        if (rule.required && (!value || value.toString().trim() === '')) {
          return rule.requiredMessage || `${name} is required`;
        }
        if (rule.minLength && value && value.length < rule.minLength) {
          return `Minimum ${rule.minLength} characters required`;
        }
        if (rule.maxLength && value && value.length > rule.maxLength) {
          return `Maximum ${rule.maxLength} characters allowed`;
        }
        if (rule.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) return 'Invalid email format';
        }
        if (rule.type === 'phone' && value) {
          const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
          if (!phoneRegex.test(value))
            return 'Invalid phone format (10-15 digits)';
        }
        if (rule.type === 'url' && value) {
          try {
            const url = new URL(value);
            if (!['http:', 'https:'].includes(url.protocol)) {
              return 'URL must start with http:// or https://';
            }
          } catch {
            return 'Invalid URL format';
          }
        }
        if (typeof rule.validator === 'function') {
          return rule.validator(value);
        }
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

      setFormData((prev) => ({ ...prev, [name]: fieldValue }));
      setTouched((prev) => ({ ...prev, [name]: true }));
      setIsFormTouched(true);

      const error = validateField(name, fieldValue);
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
  // MANUAL FIELD UPDATE (for complex/custom fields)
  // e.g. skill arrays, rich text editors, date pickers
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
  // DEBOUNCED SAVE TO REDUX
  //
  // Guard 1 — isFormTouched: skips save on mount
  // Guard 2 — hasData: prevents saving an all-empty form
  // No nested setTimeout — no memory leak on unmount
  // ==========================================
  useEffect(() => {
    if (!isFormTouched) return;

    const hasData = Object.values(formData).some((v) =>
      Array.isArray(v) ? v.length > 0 : v?.toString().trim()
    );
    if (!hasData) return;

    const timer = setTimeout(() => {
      logger.info(`[useResumeForm] Saving ${field} to Redux...`);
      dispatch(setIsSaving(true));

      const dataToSave = sanitize ? sanitize(formData) : formData;
      dispatch(updateCurrentResumeField({ field, value: dataToSave }));

      dispatch(setIsSaving(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [formData, isFormTouched, dispatch]);

  // ==========================================
  // FORM VALIDITY
  // Single source of truth — components use this, not their own isValid
  // ==========================================
  const isValid = useCallback(() => {
    const hasAllRequired = requiredFields.every((f) =>
      formData[f]?.toString().trim()
    );
    const hasNoErrors = !Object.values(errors).some(Boolean);
    return hasAllRequired && hasNoErrors;
  }, [formData, errors, requiredFields]);

  // ==========================================
  // RETURN
  // ==========================================
  return {
    formData,
    setFormData,
    errors,
    touched,
    isFormTouched,
    setIsFormTouched,
    isValid,
    handleChange,
    handleBlur,
    updateField,
    resetForm,
    validateField,
  };
}
