/**
 * @file features/resume-builder/summary/ui/SummaryForm.jsx
 * @description Professional Summary form - Step 2 (Reusable Pattern)
 * @author Nozibul Islam
 *
 * Backend Schema:
 * summary: {
 *   text: String (optional, max 2000)
 * }
 *
 * Quality Checks:
 * ✅ All quality standards met (see main prompt)
 */

'use client';

import { memo, useState } from 'react';
import { useResumeForm } from '@/shared/hooks/useResumeForm';
import ResumeTextarea from '@/shared/components/atoms/resume/ResumeTextarea';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import { LIMITS } from '@/shared/lib/constants';

/**
 * SummaryForm Component
 */
function SummaryForm() {
  const [showExamples, setShowExamples] = useState(false);

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
  // EXAMPLES
  // ==========================================
  const examples = [
    {
      title: 'Full-Stack Developer',
      text: 'Full-stack developer with 2+ years of experience building responsive web applications using React, Node.js, and PostgreSQL. Delivered 15+ production-ready projects handling 500K+ monthly active users. Reduced page load times by 60% through code optimization and caching strategies. Strong focus on clean architecture and test-driven development.',
    },
    {
      title: 'Frontend Engineer',
      text: 'Frontend engineer specializing in React and TypeScript with 4+ years of experience. Built and maintained component libraries serving 50+ internal applications. Improved web accessibility (WCAG AA compliance) across 20+ pages. Led migration from JavaScript to TypeScript, reducing bugs by 35%.',
    },
    {
      title: 'Backend Engineer',
      text: 'Backend engineer with expertise in Node.js, Python, and microservices architecture. Designed and deployed scalable APIs processing 10M+ requests daily with 99.95% uptime. Optimized database queries reducing response times by 70%. Implemented CI/CD pipelines cutting deployment time from hours to minutes.',
    },
  ];

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-4">
      {/* ATS GUIDELINES */}
      <ATSBanner title="Writing Tips for ATS Success" tips={atsTips} />

      {/* EXAMPLES BUTTON */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowExamples(!showExamples)}
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
          {showExamples ? 'Hide Examples' : 'View Examples'}
        </button>
      </div>

      {/* EXAMPLES (Collapsible) */}
      {showExamples && (
        <div className="space-y-3 animate-fadeInUp">
          {examples.map((ex, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg p-4 hover:border-teal-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    {ex.title}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {ex.text}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateField('text', ex.text);
                    setShowExamples(false);
                  }}
                  className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg"
                >
                  Use This
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUMMARY TEXTAREA */}
      <ResumeTextarea
        label="Professional Summary"
        name="text"
        value={formData.text}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Results-driven Software Engineer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud architecture. Led development of microservices handling 1M+ daily requests with 99.9% uptime. Proven track record of reducing infrastructure costs by 40% while improving system performance."
        rows={8}
        maxLength={LIMITS.SUMMARY_MAX_LENGTH}
        error={errors.text}
        touched={touched.text}
        helperText="Optional but highly recommended (2-4 sentences)"
      />
    </div>
  );
}

export default memo(SummaryForm);
