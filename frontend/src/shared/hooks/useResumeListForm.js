/**
 * @file shared/hooks/useResumeListForm.js
 * @description Reusable base hook for array-based resume builder forms
 * @author Nozibul Islam
 *
 * ✅ One-time initialization from Redux (useRef — no loop, no stale closure)
 * ✅ Empty array guard — [] does not trigger initialization
 * ✅ hasDataCheck — custom check for complex initialization conditions
 * ✅ touched guard — no save triggered on mount
 * ✅ filterEmpty — saves only meaningful items, not blank entries
 * ✅ Debounced auto-save to Redux (500ms)
 * ✅ No nested setTimeout — no memory leak on unmount
 * ✅ add, remove, update, reorder helpers included
 * ✅ handleAdd returns false if max limit reached — caller shows alert
 * ✅ createItem defined outside component — stable reference
 * ✅ Logout / re-login safe — ref resets automatically on unmount
 *
 * Usage (default):
 *   useResumeListForm({
 *     field: 'workExperience',
 *     createItem: createEmptyExperience,
 *     reduxData: resumeData?.workExperience,
 *     maxItems: LIMITS.MAX_WORK_EXPERIENCES,
 *     filterEmpty: (item) => item.jobTitle?.trim() || item.company?.trim(),
 *   });
 *
 * Usage (custom hasDataCheck):
 *   useResumeListForm({
 *     field: 'certifications',
 *     createItem: createEmptyCertification,
 *     reduxData: resumeData?.certifications,
 *     hasDataCheck: (data) => data.some(item => item.name?.trim()),
 *   });
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  updateCurrentResumeField,
  setIsSaving,
} from '@/shared/store/slices/resumeSlice';
import { reorderArray } from '@/shared/lib/utils';
import logger from '@/shared/lib/logger';

/**
 * Default data check — works for standard array-based forms
 * Returns true if reduxData is a non-empty array
 */
function defaultHasDataCheck(data) {
  return Array.isArray(data) && data.length > 0;
}

/**
 * @param {Object}   options
 * @param {string}   options.field         - Redux field key
 * @param {Function} options.createItem    - Factory fn for a new empty item (define outside component)
 * @param {Array}    options.reduxData     - resumeData?.workExperience etc.
 * @param {Function} [options.hasDataCheck] - Custom fn: (data) => boolean
 */
export function useResumeListForm({
  field,
  createItem,
  reduxData,
  hasDataCheck = defaultHasDataCheck,
  maxItems = Infinity,
  filterEmpty,
}) {
  const dispatch = useDispatch();

  // ==========================================
  // STATE
  // ==========================================
  const [items, setItems] = useState(() => [createItem()]);
  const [touched, setTouched] = useState(false);

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
  // Default: non-empty array check.
  // Override for custom conditions if needed.
  // ==========================================
  useEffect(() => {
    if (hasInitialized.current) return;
    if (!reduxData || !hasDataCheck(reduxData)) return;

    setItems(reduxData);
    hasInitialized.current = true;
    logger.info(`[useResumeListForm] ${field} initialized from Redux`);
  }, [reduxData]);

  // ==========================================
  // DEBOUNCED SAVE TO REDUX
  //
  // Guard — touched: skips save on mount
  // filterEmpty: only meaningful items saved
  // No nested setTimeout — no memory leak on unmount
  // ==========================================
  useEffect(() => {
    if (!touched) return;

    const timer = setTimeout(() => {
      logger.info(`[useResumeListForm] Saving ${field} to Redux...`);
      dispatch(setIsSaving(true));

      const dataToSave = filterEmpty ? items.filter(filterEmpty) : items;
      dispatch(updateCurrentResumeField({ field, value: dataToSave }));

      dispatch(setIsSaving(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [items, touched, dispatch]);

  // ==========================================
  // HANDLERS
  // createItem defined outside component — stable reference
  // ==========================================
  const handleAdd = useCallback(() => {
    if (items.length >= maxItems) {
      logger.warn(`[useResumeListForm] Max items reached: ${maxItems}`);
      return false;
    }
    setItems((prev) => [...prev, createItem()]);
    setTouched(true);
    logger.info(`[useResumeListForm] Added new ${field} item`);
    return true;
  }, [items.length, maxItems, createItem, field]);

  const handleRemove = useCallback(
    (index) => {
      setItems((prev) =>
        prev.length === 1 ? [createItem()] : prev.filter((_, i) => i !== index)
      );
      setTouched(true);
      logger.info(
        `[useResumeListForm] Removed ${field} item at index ${index}`
      );
    },
    [createItem, field]
  );

  const handleUpdate = useCallback((index, fieldName, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [fieldName]: value };
      return updated;
    });
    setTouched(true);
  }, []);

  const handleReorder = useCallback(
    (fromIndex, toIndex) => {
      setItems((prev) => reorderArray(prev, fromIndex, toIndex));
      setTouched(true);
      logger.info(
        `[useResumeListForm] Reordered ${field}: ${fromIndex} → ${toIndex}`
      );
    },
    [field]
  );

  // ==========================================
  // RETURN
  // ==========================================
  return {
    items,
    setItems,
    touched,
    setTouched,
    handleAdd,
    handleRemove,
    handleUpdate,
    handleReorder,
  };
}
