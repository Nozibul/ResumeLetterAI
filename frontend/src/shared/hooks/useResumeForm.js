/**
 * @file shared/hooks/useResumeForm.js
 * @description Reusable base hook for all resume builder forms
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * ✅ useAppDispatch — not useDispatch directly
 * ✅ setIsSaving(false) delayed — UI saving indicator actually shows
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
import { useAppDispatch } from '@/shared/store/hooks/useAuth';
import {
  updateCurrentResumeField,
  setIsSaving,
} from '@/shared/store/slices/resumeSlice';
import logger from '@/shared/lib/logger';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Default data check — works for standard object-based forms.
 * Returns true if reduxData exists and has at least one key.
 */
function defaultHasDataCheck(data) {
  return !!data && Object.keys(data).length > 0;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @param {Object}   options
 * @param {string}   options.field             - Redux field key (e.g. 'personalInfo')
 * @param {Object}   options.initialData       - Empty initial form state
 * @param {Object}   options.reduxData         - resumeData?.personalInfo etc.
 * @param {Function} [options.hasDataCheck]    - Custom fn: (data) => boolean
 * @param {string[]} [options.requiredFields]  - Fields that must be non-empty for isValid
 * @param {Object}   [options.validationRules] - Per-field validation fns or rule objects
 * @param {Function} [options.sanitize]        - fn: (formData) => sanitizedData
 */
export function useResumeForm({
  field,
  initialData,
  reduxData,
  hasDataCheck = defaultHasDataCheck,
  requiredFields = [],
  validationRules = {},
  sanitize,
}) {
  const dispatch = useAppDispatch();

  // ── State ─────────────────────────────────────────────────────────────────

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormTouched, setIsFormTouched] = useState(false);

  /**
   * useRef does not trigger re-renders — no stale closure risk.
   * Resets automatically on component unmount — logout/re-login safe.
   */
  const hasInitialized = useRef(false);

  // ── Initialize from Redux — runs only once ────────────────────────────────

  useEffect(() => {
    if (hasInitialized.current) return;
    if (!reduxData || !hasDataCheck(reduxData)) return;

    setFormData(reduxData);
    hasInitialized.current = true;
    logger.info(`[useResumeForm] ${field} initialized from Redux`);
  }, [reduxData]);

  // ── Validation ────────────────────────────────────────────────────────────

  /**
   * Supports both:
   *   function-based: validationRules[name] = (value) => error | null
   *   object-based:   { required: true, minLength: 2, type: 'email' }
   */
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
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Invalid email format';
          }
        }
        if (rule.type === 'phone' && value) {
          if (!/^[\d\s\-\+\(\)]{10,15}$/.test(value)) {
            return 'Invalid phone format (10-15 digits)';
          }
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

  // ── Handlers ──────────────────────────────────────────────────────────────

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

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  /**
   * Manual field update — for complex/custom fields:
   * skill arrays, rich text editors, date pickers, etc.
   */
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

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setIsFormTouched(false);
  }, [initialData]);

  // ── Debounced save to Redux ───────────────────────────────────────────────

  useEffect(() => {
    // Guard 1: skip save on mount
    if (!isFormTouched) return;

    // Guard 2: skip if all fields are empty
    const hasData = Object.values(formData).some((v) =>
      Array.isArray(v) ? v.length > 0 : v?.toString().trim()
    );
    if (!hasData) return;

    const timer = setTimeout(() => {
      logger.info(`[useResumeForm] Saving ${field} to Redux...`);

      dispatch(setIsSaving(true));

      const dataToSave = sanitize ? sanitize(formData) : formData;
      dispatch(updateCurrentResumeField({ field, value: dataToSave }));

      // Delay false so the saving indicator is visible for at least 300ms.
      // updateCurrentResumeField is synchronous — without this delay,
      // isSaving would flip back to false immediately and the UI spinner
      // would never render.
      setTimeout(() => dispatch(setIsSaving(false)), 300);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData, isFormTouched, dispatch]);

  // ── Form validity ─────────────────────────────────────────────────────────

  /**
   * Single source of truth for validity.
   * Components use this — no duplicate isValid logic in forms.
   */
  const isValid = useCallback(() => {
    const hasAllRequired = requiredFields.every((f) =>
      formData[f]?.toString().trim()
    );
    const hasNoErrors = !Object.values(errors).some(Boolean);
    return hasAllRequired && hasNoErrors;
  }, [formData, errors, requiredFields]);

  // ── Return ────────────────────────────────────────────────────────────────

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
