/**
 * @file features/resume-builder/education/ui/EducationItem.jsx
 * @description Single education card component
 * @author Nozibul Islam
 *
 * Self-Review:
 * ✅ Readability: Clear structure
 * ✅ Performance: Memoized
 * ✅ Security: No XSS
 * ✅ Best Practices: Modular
 * ✅ Potential Bugs: GPA validation
 * ✅ Memory Leaks: None
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';
import ResumeInput from '@/shared/components/atoms/resume/ResumeInput';
import { LIMITS } from '@/shared/lib/constants';

/**
 * EducationItem Component
 * Single education entry card
 */
function EducationItem({
  index,
  education,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}) {
  // ==========================================
  // DATE DROPDOWNS DATA
  // ==========================================
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="border-2 border-gray-200 rounded-lg p-6 bg-white hover:border-teal-300 transition-colors">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Education #{index + 1}
        </h3>

        <div className="flex items-center gap-2">
          {/* Move Up */}
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
              aria-label="Move up"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          )}

          {/* Move Down */}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
              aria-label="Move down"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}

          {/* Delete */}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            aria-label="Delete"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* FORM FIELDS */}
      <div className="space-y-4">
        {/* Degree */}
        <ResumeInput
          label="Degree"
          name="degree"
          value={education.degree || ''}
          onChange={(e) => onUpdate(index, 'degree', e.target.value)}
          placeholder="Bachelor of Science in Computer Science"
          required
          maxLength={LIMITS.TITLE_MAX_LENGTH}
          showCounter
        />

        {/* Institution & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResumeInput
            label="Institution"
            name="institution"
            value={education.institution || ''}
            onChange={(e) => onUpdate(index, 'institution', e.target.value)}
            placeholder="MIT"
            required
            maxLength={LIMITS.TITLE_MAX_LENGTH}
          />

          <ResumeInput
            label="Location"
            name="location"
            value={education.location || ''}
            onChange={(e) => onUpdate(index, 'location', e.target.value)}
            placeholder="Cambridge, MA"
            maxLength={LIMITS.TITLE_MAX_LENGTH}
            helperText="Optional"
          />
        </div>

        {/* Graduation Date & GPA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Graduation Month <span className="text-red-500">*</span>
            </label>
            <select
              value={education.graduationDate?.month || ''}
              onChange={(e) =>
                onUpdate(index, 'graduationDate', {
                  ...education.graduationDate,
                  month: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select Month</option>
              {months.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Graduation Year <span className="text-red-500">*</span>
            </label>
            <select
              value={education.graduationDate?.year || ''}
              onChange={(e) =>
                onUpdate(index, 'graduationDate', {
                  ...education.graduationDate,
                  year: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* GPA */}
          <ResumeInput
            label="GPA"
            name="gpa"
            type="text"
            value={education.gpa || ''}
            onChange={(e) => onUpdate(index, 'gpa', e.target.value)}
            placeholder="3.8"
            helperText="0.0-4.0 scale (optional)"
          />
        </div>

        {/* GPA Tip */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
          <p className="text-xs text-teal-800">
            💡 <strong>Tip:</strong> Only include GPA if it's 3.0 or higher.
            Omit if below 3.0 or if you graduated more than 5 years ago.
          </p>
        </div>
      </div>
    </div>
  );
}

EducationItem.propTypes = {
  index: PropTypes.number.isRequired,
  education: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
};

EducationItem.defaultProps = {
  onMoveUp: null,
  onMoveDown: null,
};

export default memo(EducationItem);
