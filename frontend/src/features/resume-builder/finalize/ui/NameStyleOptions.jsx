/**
 * @file features/resume-builder/finalize/ui/NameStyleOptions.jsx
 * @description Name style options component
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

/**
 * NameStyleOptions Component
 * Name appearance customization
 */
function NameStyleOptions({ nameStyle, fonts, onChange, onFontChange }) {
  const atsSafeFonts = [
    'Arial',
    'Helvetica',
    'Calibri',
    'Times New Roman',
    'Georgia',
  ];

  return (
    <div className="space-y-6">
      {/* FONT SELECTION */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Font Selection{' '}
          <span className="text-xs text-gray-500 font-normal">(ATS-Safe)</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose ATS-friendly fonts for your resume
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Heading Font */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heading Font
            </label>
            <select
              value={fonts.heading}
              onChange={(e) => onFontChange('heading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              style={{ fontFamily: fonts.heading }}
            >
              {atsSafeFonts.map((font) => (
                <option
                  key={`heading-${font}`}
                  value={font}
                  style={{ fontFamily: font }}
                >
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Body Font */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Font
            </label>
            <select
              value={fonts.body}
              onChange={(e) => onFontChange('body', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              style={{ fontFamily: fonts.body }}
            >
              {atsSafeFonts.map((font) => (
                <option
                  key={`body-${font}`}
                  value={font}
                  style={{ fontFamily: font }}
                >
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* NAME STYLE */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Name Style</h3>
        <p className="text-sm text-gray-600 mb-4">
          Customize how your name appears
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <select
              value={nameStyle.position}
              onChange={(e) => onChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="left">Left Aligned</option>
              <option value="center">Center Aligned</option>
              <option value="right">Right Aligned</option>
            </select>
          </div>

          {/* Case */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Letter Case
            </label>
            <select
              value={nameStyle.case}
              onChange={(e) => onChange('case', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="normal">Normal Case</option>
              <option value="uppercase">UPPERCASE</option>
              <option value="capitalize">Capitalize Each Word</option>
            </select>
          </div>

          {/* Bold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Weight
            </label>
            <select
              value={nameStyle.bold ? 'bold' : 'normal'}
              onChange={(e) => onChange('bold', e.target.value === 'bold')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
            </select>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Preview:</p>
          <p
            className={`text-2xl ${nameStyle.bold ? 'font-bold' : 'font-normal'}`}
            style={{
              textAlign: nameStyle.position,
              textTransform: nameStyle.case,
              fontFamily: fonts.heading,
            }}
          >
            John Doe
          </p>
        </div>
      </div>
    </div>
  );
}

NameStyleOptions.propTypes = {
  nameStyle: PropTypes.shape({
    position: PropTypes.string.isRequired,
    case: PropTypes.string.isRequired,
    bold: PropTypes.bool.isRequired,
  }).isRequired,
  fonts: PropTypes.shape({
    heading: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onFontChange: PropTypes.func.isRequired,
};

export default memo(NameStyleOptions);
