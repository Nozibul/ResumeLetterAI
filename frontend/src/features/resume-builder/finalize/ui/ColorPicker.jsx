/**
 * @file features/resume-builder/finalize/ui/ColorPicker.jsx
 * @description ATS-safe color picker component
 * @author Nozibul Islam
 *
 * Self-Review:
 * ✅ Readability: Clear
 * ✅ Performance: Memoized
 * ✅ Security: No XSS
 * ✅ Best Practices: Accessible
 * ✅ Potential Bugs: None
 * ✅ Memory Leaks: None
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';
import { ATS_SAFE_COLORS } from '@/shared/lib/constants';

/**
 * ColorPicker Component
 * ATS-safe color selection
 */
function ColorPicker({ colors, onChange }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Color Scheme{' '}
        <span className="text-xs text-gray-500 font-normal">(ATS-Safe)</span>
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Choose professional colors that ATS systems can process
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Primary Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Color
          </label>
          <select
            value={colors.primary}
            onChange={(e) => onChange('primary', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {ATS_SAFE_COLORS.map((color, idx) => (
              <option key={`primary-${color.hex}-${idx}`} value={color.hex}>
                {color.name}
              </option>
            ))}
          </select>
          <div
            className="mt-2 h-10 rounded border border-gray-300 shadow-sm"
            style={{ backgroundColor: colors.primary }}
            aria-label={`Primary color preview: ${colors.primary}`}
          />
        </div>

        {/* Secondary Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Color
          </label>
          <select
            value={colors.secondary}
            onChange={(e) => onChange('secondary', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {ATS_SAFE_COLORS.map((color, idx) => (
              <option key={`secondary-${color.hex}-${idx}`} value={color.hex}>
                {color.name}
              </option>
            ))}
          </select>
          <div
            className="mt-2 h-10 rounded border border-gray-300 shadow-sm"
            style={{ backgroundColor: colors.secondary }}
            aria-label={`Secondary color preview: ${colors.secondary}`}
          />
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accent Color
          </label>
          <select
            value={colors.accent}
            onChange={(e) => onChange('accent', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {ATS_SAFE_COLORS.map((color, idx) => (
              <option key={`accent-${color.hex}-${idx}`} value={color.hex}>
                {color.name}
              </option>
            ))}
          </select>
          <div
            className="mt-2 h-10 rounded border border-gray-300 shadow-sm"
            style={{ backgroundColor: colors.accent }}
            aria-label={`Accent color preview: ${colors.accent}`}
          />
        </div>
      </div>
    </div>
  );
}

ColorPicker.propTypes = {
  colors: PropTypes.shape({
    primary: PropTypes.string.isRequired,
    secondary: PropTypes.string.isRequired,
    accent: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default memo(ColorPicker);
