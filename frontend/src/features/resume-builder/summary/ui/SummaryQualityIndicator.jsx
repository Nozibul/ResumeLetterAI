/**
 * @file features/resume-builder/summary/ui/SummaryQualityIndicator.jsx
 * @description Summary quality score indicator
 * @author Nozibul Islam
 *
 * Features:
 * - Quality score (0-100)
 * - Suggestions for improvement
 * - Color-coded progress bar
 *
 * Self-Review:
 * ✅ Readability: Clear visual feedback
 * ✅ Performance: Memoized
 * ✅ Security: No XSS
 * ✅ Best Practices: Accessible
 * ✅ Potential Bugs: Null-safe
 * ✅ Memory Leaks: None
 */

'use client';

import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getSummaryQualityScore } from '../model/validation';

/**
 * SummaryQualityIndicator Component
 * Shows quality score and suggestions
 */
function SummaryQualityIndicator({ text }) {
  // ==========================================
  // CALCULATE QUALITY SCORE
  // ==========================================
  const quality = useMemo(() => {
    return getSummaryQualityScore(text);
  }, [text]);

  // ==========================================
  // COLOR BASED ON SCORE
  // ==========================================
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-700 bg-green-100';
    if (score >= 60) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Don't show if no text
  if (!text || text.trim() === '') {
    return null;
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">Summary Quality</h4>
        <span
          className={`text-sm font-bold px-3 py-1 rounded-full ${getScoreColor(quality.score)}`}
        >
          {quality.score}/100
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(quality.score)}`}
          style={{ width: `${quality.score}%` }}
          role="progressbar"
          aria-valuenow={quality.score}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Suggestions */}
      {quality.suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700">Suggestions:</p>
          <ul className="space-y-1">
            {quality.suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-gray-600"
              >
                <svg
                  className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Perfect Score Message */}
      {quality.score >= 90 && (
        <div className="bg-green-50 border border-green-200 rounded p-2">
          <p className="text-xs text-green-800">
            ✨ <strong>Excellent!</strong> Your summary is well-optimized for
            ATS systems.
          </p>
        </div>
      )}
    </div>
  );
}

SummaryQualityIndicator.propTypes = {
  text: PropTypes.string.isRequired,
};

export default memo(SummaryQualityIndicator);
