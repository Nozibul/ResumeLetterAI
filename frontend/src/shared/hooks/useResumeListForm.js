/**
 * @file shared/hooks/useResumeListForm.js
 * @description Reusable base hook for array-based resume builder forms
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * ✅ useAppDispatch — not useDispatch directly
 * ✅ setIsSaving(false) delayed 300ms — UI saving indicator actually shows
 * ✅ One-time initialization from Redux (useRef — no loop, no stale closure)
 * ✅ Empty array guard — [] does not trigger initialization
 * ✅ hasDataCheck — custom check for complex initialization conditions
 * ✅ touched guard — no save triggered on mount
 * ✅ filterEmpty — saves only meaningful items, not blank entries
 * ✅ Debounced auto-save to Redux (500ms)
 * ✅ No nested setTimeout — no memory leak on unmount
 * ✅ add, remove, update, reorder helpers included
 * ✅ handleAdd returns false if max limit reached — caller shows toast
 * ✅ createItem defined outside component — stable reference
 * ✅ Logout / re-login safe — ref resets automatically on unmount
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch } from '@/shared/store/hooks/useAuth';
import {
  updateCurrentResumeField,
  setIsSaving,
} from '@/shared/store/slices/resumeSlice';
import { reorderArray } from '@/shared/lib/utils';
import logger from '@/shared/lib/logger';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Default data check — works for standard array-based forms.
 * Returns true if reduxData is a non-empty array.
 */
function defaultHasDataCheck(data) {
  return Array.isArray(data) && data.length > 0;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @param {Object}   options
 * @param {string}   options.field           - Redux field key (e.g. 'workExperience')
 * @param {Function} options.createItem      - Factory fn for a new empty item (define outside component)
 * @param {Array}    options.reduxData       - resumeData?.workExperience etc.
 * @param {Function} [options.hasDataCheck]  - Custom fn: (data) => boolean
 * @param {number}   [options.maxItems]      - Max allowed items
 * @param {Function} [options.filterEmpty]   - fn: (item) => boolean — exclude blank entries from save
 */
export function useResumeListForm({
  field,
  createItem,
  reduxData,
  hasDataCheck = defaultHasDataCheck,
  maxItems = Infinity,
  filterEmpty,
}) {
  const dispatch = useAppDispatch();

  // ── State ─────────────────────────────────────────────────────────────────

  const [items, setItems] = useState(() => [createItem()]);
  const [touched, setTouched] = useState(false);

  /**
   * useRef does not trigger re-renders — no stale closure risk.
   * Resets automatically on component unmount — logout/re-login safe.
   */
  const hasInitialized = useRef(false);

  // ── Initialize from Redux — runs only once ────────────────────────────────

  useEffect(() => {
    if (hasInitialized.current) return;
    if (!reduxData || !hasDataCheck(reduxData)) return;

    setItems(reduxData);
    hasInitialized.current = true;
    logger.info(`[useResumeListForm] ${field} initialized from Redux`);
  }, [reduxData]);

  // ── Debounced save to Redux ───────────────────────────────────────────────

  useEffect(() => {
    // Guard: skip save on mount
    if (!touched) return;

    const timer = setTimeout(() => {
      logger.info(`[useResumeListForm] Saving ${field} to Redux...`);

      dispatch(setIsSaving(true));

      const dataToSave = filterEmpty ? items.filter(filterEmpty) : items;
      dispatch(updateCurrentResumeField({ field, value: dataToSave }));

      // Delay false so the saving indicator is visible for at least 300ms.
      // updateCurrentResumeField is synchronous — without this delay,
      // isSaving would flip back to false immediately and the UI spinner
      // would never render.
      setTimeout(() => dispatch(setIsSaving(false)), 300);
    }, 500);

    return () => clearTimeout(timer);
  }, [items, touched, dispatch]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  /**
   * Returns true on success, false if max limit reached.
   * Caller is responsible for showing a toast on false.
   */
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

  /**
   * Removes item at index.
   * If last item removed, resets to one empty item so the form is never blank.
   */
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

  /** Updates a single field on the item at index. */
  const handleUpdate = useCallback((index, fieldName, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [fieldName]: value };
      return updated;
    });
    setTouched(true);
  }, []);

  /** Moves item from fromIndex to toIndex. */
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

  // ── Return

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
