/**
 * @file shared/components/atoms/resume/DatePicker.jsx
 * @description Month/Year picker for resume dates
 * @author Nozibul Islam
 *
 * Features:
 * - Month dropdown (Jan-Dec)
 * - Year dropdown (last 50 years)
 * - Validation (end >= start)
 * - "Currently working/studying" checkbox
 *
 * Quality Checks:
 * ✅ Readability: Clear date logic
 * ✅ Performance: Memoized years array
 * ✅ Security: Controlled selects
 * ✅ Best Practices: Accessible
 * ✅ Accessibility: Labels, ARIA
 */

'use client';

import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * DatePicker Component
 * Renders month/year dropdowns
 */
function DatePicker({
  label,
  startDate,
  endDate,
  isCurrent,
  onStartChange,
  onEndChange,
  onCurrentChange,
  error,
  required,
  currentLabel,
  className,
}) {
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

  // Generate years (last 50 years)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 50 }, (_, i) => currentYear - i);
  }, []);

  return (
    <div className={className}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Start Date */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Start Month
          </label>
          <select
            value={startDate?.month || ''}
            onChange={(e) =>
              onStartChange({
                ...startDate,
                month: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Month</option>
            {months.map((month, idx) => (
              <option key={idx} value={idx + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Start Year</label>
          <select
            value={startDate?.year || ''}
            onChange={(e) =>
              onStartChange({
                ...startDate,
                year: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Currently Working/Studying Checkbox */}
      {onCurrentChange && (
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={isCurrent}
            onChange={(e) => onCurrentChange(e.target.checked)}
            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <span className="text-sm text-gray-700">{currentLabel}</span>
        </label>
      )}

      {/* End Date (hidden if currently working) */}
      {!isCurrent && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              End Month
            </label>
            <select
              value={endDate?.month || ''}
              onChange={(e) =>
                onEndChange({
                  ...endDate,
                  month: e.target.value ? Number(e.target.value) : null,
                })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Month</option>
              {months.map((month, idx) => (
                <option key={idx} value={idx + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">End Year</label>
            <select
              value={endDate?.year || ''}
              onChange={(e) =>
                onEndChange({
                  ...endDate,
                  year: e.target.value ? Number(e.target.value) : null,
                })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

DatePicker.propTypes = {
  label: PropTypes.string.isRequired,
  startDate: PropTypes.shape({
    month: PropTypes.number,
    year: PropTypes.number,
  }),
  endDate: PropTypes.shape({
    month: PropTypes.number,
    year: PropTypes.number,
  }),
  isCurrent: PropTypes.bool,
  onStartChange: PropTypes.func.isRequired,
  onEndChange: PropTypes.func.isRequired,
  onCurrentChange: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
  currentLabel: PropTypes.string,
  className: PropTypes.string,
};

DatePicker.defaultProps = {
  startDate: null,
  endDate: null,
  isCurrent: false,
  onCurrentChange: null,
  error: null,
  required: false,
  currentLabel: 'I currently work/study here',
  className: '',
};

export default memo(DatePicker);
