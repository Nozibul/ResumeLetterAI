/**
 * @file features/resume-builder/finalize/ui/NameStyleOptions.jsx
 * @description Name style + Section Heading style customization
 * @author Nozibul Islam
 *
 * ✅ Font Selection — heading, body, italic toggle
 * ✅ Name Style — position, case, bold
 * ✅ Section Heading Style — case, fontWeight, borderStyle (NEW)
 * ✅ Live preview for both name and section heading
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';

// ==========================================
// CONSTANTS
// Defined outside component — stable reference
// ==========================================
const ATS_SAFE_FONTS = [
  'Arial',
  'Helvetica',
  'Calibri',
  'Times New Roman',
  'Georgia',
];

const SELECT_CLASS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500';

const LABEL_CLASS = 'block text-sm font-medium text-gray-700 mb-2';

/**
 * NameStyleOptions Component
 * Font selection, name style, section heading style
 *
 * Props:
 * - nameStyle         — position, case, bold, italic
 * - sectionHeadingStyle — case, fontWeight, borderStyle
 * - fonts             — heading, body
 * - onChange          — (styleType, value) for nameStyle
 * - onSectionHeadingChange — (styleType, value) for sectionHeadingStyle
 * - onFontChange      — (fontType, value) for fonts
 */
function NameStyleOptions({
  nameStyle,
  sectionHeadingStyle,
  fonts,
  onChange,
  onSectionHeadingChange,
  onFontChange,
}) {
  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ========== FONT SELECTION ========== */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Font Selection{' '}
          <span className="text-xs text-gray-500 font-normal">(ATS-Safe)</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose ATS-friendly fonts for your resume
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Heading Font */}
          <div>
            <label className={LABEL_CLASS}>Heading Font</label>
            <select
              value={fonts.heading}
              onChange={(e) => onFontChange('heading', e.target.value)}
              className={SELECT_CLASS}
              style={{ fontFamily: fonts.heading }}
            >
              {ATS_SAFE_FONTS.map((font) => (
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
            <label className={LABEL_CLASS}>Body Font</label>
            <select
              value={fonts.body}
              onChange={(e) => onFontChange('body', e.target.value)}
              className={SELECT_CLASS}
              style={{ fontFamily: fonts.body }}
            >
              {ATS_SAFE_FONTS.map((font) => (
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

        {/* Italic Toggle */}
        <div className="mt-4">
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={fonts.italic || false}
              onChange={(e) => onFontChange('italic', e.target.checked)}
              className="w-4 h-4 accent-teal-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Italic body text
            </span>
            {fonts.italic && (
              <span
                className="text-xs text-gray-500 italic"
                style={{ fontFamily: fonts.body }}
              >
                Preview
              </span>
            )}
          </label>
        </div>
      </div>

      {/* ========== NAME STYLE ========== */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Name Style</h3>
        <p className="text-sm text-gray-600 mb-4">
          Customize how your name appears at the top
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Position */}
          <div>
            <label className={LABEL_CLASS}>Position</label>
            <select
              value={nameStyle.position}
              onChange={(e) => onChange('position', e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="left">Left Aligned</option>
              <option value="center">Center Aligned</option>
              <option value="right">Right Aligned</option>
            </select>
          </div>

          {/* Case */}
          <div>
            <label className={LABEL_CLASS}>Letter Case</label>
            <select
              value={nameStyle.case}
              onChange={(e) => onChange('case', e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="normal">Normal Case</option>
              <option value="uppercase">UPPERCASE</option>
              <option value="capitalize">Capitalize Each Word</option>
            </select>
          </div>

          {/* Bold */}
          <div>
            <label className={LABEL_CLASS}>Font Weight</label>
            <select
              value={nameStyle.bold ? 'bold' : 'normal'}
              onChange={(e) => onChange('bold', e.target.value === 'bold')}
              className={SELECT_CLASS}
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
            </select>
          </div>
        </div>

        {/* Name Preview */}
        <div className="mt-4 p-2 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">Preview:</p>
          <p
            className="text-xl"
            style={{
              textAlign: nameStyle.position,
              textTransform: nameStyle.case,
              fontWeight: nameStyle.bold ? 'bold' : 'normal',
              fontFamily: fonts.heading,
            }}
          >
            John Doe
          </p>
        </div>
      </div>

      {/* ========== SECTION HEADING STYLE ========== */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Section Heading Style
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Customize how section titles appear (SUMMARY, WORK EXPERIENCE etc.)
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Case */}
          {/* Position — নতুন */}
          <div>
            <label className={LABEL_CLASS}>Position</label>
            <select
              value={sectionHeadingStyle.position || 'left'}
              onChange={(e) =>
                onSectionHeadingChange('position', e.target.value)
              }
              className={SELECT_CLASS}
            >
              <option value="left">Left Aligned</option>
              <option value="center">Center Aligned</option>
              <option value="right">Right Aligned</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Letter Case</label>
            <select
              value={sectionHeadingStyle.case}
              onChange={(e) => onSectionHeadingChange('case', e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="uppercase">UPPERCASE</option>
              <option value="capitalize">Capitalize Each Word</option>
              <option value="normal">Normal Case</option>
            </select>
          </div>

          {/* Font Weight */}
          <div>
            <label className={LABEL_CLASS}>Font Weight</label>
            <select
              value={sectionHeadingStyle.fontWeight}
              onChange={(e) =>
                onSectionHeadingChange('fontWeight', e.target.value)
              }
              className={SELECT_CLASS}
            >
              <option value="bold">Bold</option>
              <option value="normal">Normal</option>
            </select>
          </div>

          {/* Border Style */}
          <div>
            <label className={LABEL_CLASS}>Border Style</label>
            <select
              value={sectionHeadingStyle.borderStyle}
              onChange={(e) =>
                onSectionHeadingChange('borderStyle', e.target.value)
              }
              className={SELECT_CLASS}
            >
              <option value="bottom">Bottom Border</option>
              <option value="none">No Border</option>
            </select>
          </div>
        </div>

        {/* Section Heading Preview */}
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">Preview:</p>
          <p
            className="text-xs tracking-wide"
            style={{
              textTransform: sectionHeadingStyle.case,
              fontWeight: sectionHeadingStyle.fontWeight,
              fontFamily: fonts.heading,
              borderBottom:
                sectionHeadingStyle.borderStyle === 'bottom'
                  ? '1px solid #d1d5db'
                  : 'none',
              paddingBottom:
                sectionHeadingStyle.borderStyle === 'bottom' ? '4px' : '0',
            }}
          >
            Work Experience
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
  sectionHeadingStyle: PropTypes.shape({
    case: PropTypes.string.isRequired,
    fontWeight: PropTypes.string.isRequired,
    borderStyle: PropTypes.string.isRequired,
  }).isRequired,
  fonts: PropTypes.shape({
    heading: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    italic: PropTypes.bool,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSectionHeadingChange: PropTypes.func.isRequired,
  onFontChange: PropTypes.func.isRequired,
};

export default memo(NameStyleOptions);
