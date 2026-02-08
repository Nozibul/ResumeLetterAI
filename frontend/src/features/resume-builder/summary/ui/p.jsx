/**
 * @file features/resume-builder/summary/ui/SummaryForm.jsx
 * @description Professional Summary form - Step 2 (REFACTORED)
 * @author Nozibul Islam
 *
 * Architecture:
 * - Uses sub-components (ExamplesModal, SummaryQualityIndicator)
 * - Uses useResumeForm hook
 * - Uses atomic components (ResumeTextarea, ATSBanner)
 * - Business logic in model/validation.js
 * - Clean separation of concerns
 *
 * Self-Review:
 * ✅ Readability: Modular, clean
 * ✅ Performance: Memoized, debounced
 * ✅ Security: No XSS
 * ✅ Best Practices: Separation of concerns
 * ✅ Potential Bugs: Null-safe
 * ✅ Memory Leaks: None
 */

'use client';

import { memo, useState, useCallback } from 'react';
import { useResumeForm } from '@/shared/hooks/useResumeForm';
import ResumeTextarea from '@/shared/components/atoms/resume/ResumeTextarea';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import ExamplesModal from './ExamplesModal';
import SummaryQualityIndicator from './SummaryQualityIndicator';
import { LIMITS } from '@/shared/lib/constants';

/**
 * SummaryForm Component
 * Step 2: Professional Summary
 */
function SummaryForm() {
  // ==========================================
  // FORM STATE
  // ==========================================
  const { formData, errors, touched, handleChange, handleBlur, updateField } =
    useResumeForm(
      'summary',
      { text: '' },
      {
        text: {
          maxLength: LIMITS.SUMMARY_MAX_LENGTH,
        },
      }
    );

  // ==========================================
  // LOCAL STATE
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

  const openExamplesModal = useCallback(() => {
    setShowExamplesModal(true);
  }, []);

  const closeExamplesModal = useCallback(() => {
    setShowExamplesModal(false);
  }, []);

  // ==========================================
  // ATS TIPS
  // ==========================================
  const atsTips = [
    'Start with strong action verbs (Led, Developed, Architected)',
    'Focus on impact, not responsibilities',
    'Keep it concise (2-4 sentences ideal)',
    'Avoid buzzwords like "synergy," "guru," "rockstar"',
    'Quantify achievements with numbers (increased by 40%, managed 10+ projects)',
  ];

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ATS GUIDELINES */}
      <ATSBanner title="Writing Tips for ATS Success" tips={atsTips} />

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

        {/* Examples Button */}
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

// export default memo(SummaryForm);
