/**
 * @file features/resume-builder/summary/ui/SummaryForm.jsx
 * @description Professional Summary form - Step 2
 * @author Nozibul Islam
 *
 * Refactored to use shared useResumeForm hook.
 * All init, save, and validation logic lives in the hook.
 * Component is responsible for UI only.
 */

'use client';

import { memo, useState, useCallback } from 'react';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import { useResumeForm } from '@/shared/hooks/useResumeForm';
import ResumeTextarea from '@/shared/components/atoms/resume/ResumeTextarea';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import ExamplesModal from './ExamplesModal';
import SummaryQualityIndicator from './SummaryQualityIndicator';
import { summaryValidationRules } from '../model/validation';
import { LIMITS } from '@/shared/lib/constants';

// ==========================================
// CONSTANTS
// ==========================================
const INITIAL_FORM_DATA = { text: '' };

const ATS_TIPS = [
  'Start with strong action verbs (Led, Developed, Architected)',
  'Focus on impact, not responsibilities',
  'Keep it concise (2-4 sentences ideal)',
  'Avoid buzzwords like "synergy," "guru," "rockstar"',
  'Quantify achievements with numbers (increased by 40%, managed 10+ projects)',
];

/**
 * SummaryForm Component
 * Step 2: Professional Summary
 */
function SummaryForm() {
  const resumeData = useCurrentResumeData();

  // ==========================================
  // FORM HOOK
  // All init, save, and validation logic lives in useResumeForm.
  // summaryValidationRules imported directly from validation.js — no duplicate.
  // No requiredFields — summary is optional.
  // updateField used when user selects an example from the modal.
  // ==========================================
  const { formData, errors, touched, handleChange, handleBlur, updateField } =
    useResumeForm({
      field: 'summary',
      initialData: INITIAL_FORM_DATA,
      reduxData: resumeData?.summary,
      validationRules: summaryValidationRules,
    });

  // ==========================================
  // LOCAL UI STATE
  // Only UI concerns live here — not form logic
  // ==========================================
  const [showExamplesModal, setShowExamplesModal] = useState(false);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleSelectExample = useCallback(
    (exampleText) => {
      updateField('text', exampleText);
    },
    [updateField]
  );

  const openExamplesModal = useCallback(() => setShowExamplesModal(true), []);
  const closeExamplesModal = useCallback(() => setShowExamplesModal(false), []);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ATS GUIDELINES */}
      <ATSBanner title="Writing Tips for ATS Success" tips={ATS_TIPS} />

      {/* HEADER WITH EXAMPLES BUTTON */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="summary-text"
          className="block text-sm font-medium text-gray-700"
        >
          Professional Summary{' '}
          <span className="text-gray-400 text-xs font-normal">
            (Optional but highly recommended)
          </span>
        </label>

        <button
          type="button"
          onClick={openExamplesModal}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          View Examples
        </button>
      </div>

      {/* SUMMARY TEXTAREA */}
      <ResumeTextarea
        label=""
        name="text"
        value={formData.text}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Results-driven Software Engineer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud architecture. Led development of microservices handling 1M+ daily requests with 99.9% uptime. Proven track record of reducing infrastructure costs by 40% while improving system performance."
        rows={8}
        maxLength={LIMITS.SUMMARY_MAX_LENGTH}
        error={errors.text}
        touched={touched.text}
        helperText="Aim for 50-100 words (2-4 sentences)"
      />

      {/* QUALITY INDICATOR */}
      <SummaryQualityIndicator text={formData.text} />

      {/* EXAMPLES MODAL */}
      <ExamplesModal
        isOpen={showExamplesModal}
        onClose={closeExamplesModal}
        onSelectExample={handleSelectExample}
      />
    </div>
  );
}

export default memo(SummaryForm);
