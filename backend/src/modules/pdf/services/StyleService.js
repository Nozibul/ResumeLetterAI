/**
 * @file StyleService.js
 * @description Builds inline CSS string for resume PDF template.
 *              Calls resumeStyles.js functions with user customization.
 *              Output replaces {{inlineStyles}} in resume-template.html.
 * @module modules/pdf/services/StyleService
 * @author Nozibul Islam
 */

const {
  getNameStyle,
  getSectionHeadingStyle,
  getBodyStyle,
  getHeaderStyle,
  getAlignmentStyle,
} = require('../../../shared/utils/resumeStyles');

// ==========================================
// CONSTANTS
// ==========================================

const PDF_FONT_SIZE = 10.5;
const PDF_LINE_HEIGHT = '1.4';

// ATS standard sizes
const PDF_NAME_SIZE = '22pt';
const PDF_JOBTITLE_SIZE = '12pt';
const PDF_SECTION_SIZE = '11.5pt';

// ==========================================
// HELPERS
// ==========================================

/**
 * Convert a style object to CSS property string
 * e.g. { fontFamily: 'Arial', fontWeight: 'bold' }
 *   →  "font-family:Arial;font-weight:bold;"
 *
 * @param {Object} styleObj
 * @returns {string}
 */
const styleObjToCSS = (styleObj) => {
  if (!styleObj || typeof styleObj !== 'object') return '';

  return Object.entries(styleObj)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
    .map(([key, value]) => {
      // Convert camelCase → kebab-case
      const cssKey = key.replace(
        /([A-Z])/g,
        (match) => `-${match.toLowerCase()}`
      );
      return `${cssKey}:${value}`;
    })
    .join(';');
};

/**
 * Convert justifyContent value → text-align equivalent
 * getAlignmentStyle returns { justifyContent: 'center' | 'flex-start' | 'flex-end' }
 * For PDF flex containers, we also need display:flex
 *
 * @param {Object} alignStyle - { justifyContent: string }
 * @returns {string} CSS string
 */
const alignStyleToCSS = (alignStyle) => {
  if (!alignStyle?.justifyContent)
    return 'display:flex;justify-content:center;flex-wrap:wrap;gap:12px;';
  return `display:flex;justify-content:${alignStyle.justifyContent};flex-wrap:wrap;gap:12px;`;
};

// ==========================================
// MAIN EXPORT
// ==========================================

/**
 * Build inline <style> block from user customization.
 * Uses resumeStyles.js pure functions — same as frontend.
 *
 * @param {Object} customization - User's customization object from Redux/DB
 * @returns {string} Full <style>...</style> block for template injection
 */
exports.buildInlineStyles = (customization) => {
  // customization can be undefined — resumeStyles.js handles defaults
  const safeCustomization =
    customization && typeof customization === 'object'
      ? customization
      : undefined;

  // Call resumeStyles.js functions — exactly like frontend does
  const bodyStyle = getBodyStyle(
    safeCustomization,
    PDF_FONT_SIZE,
    PDF_LINE_HEIGHT
  );
  const nameStyle = getNameStyle(safeCustomization);
  const sectionStyle = getSectionHeadingStyle(safeCustomization);
  const headerStyle = getHeaderStyle(safeCustomization);
  const alignStyle = getAlignmentStyle(safeCustomization?.nameStyle?.position);

  // Convert style objects to CSS strings
  const bodyCSS = styleObjToCSS(bodyStyle);
  const nameCSS = styleObjToCSS(nameStyle);
  const sectionCSS = styleObjToCSS(sectionStyle);
  const headerCSS = styleObjToCSS(headerStyle);
  const alignCSS = alignStyleToCSS(alignStyle);

  return `<style>
  .resume-body { ${bodyCSS}; }
  .resume-header { ${headerCSS}; }
  .resume-name { ${nameCSS}; font-size: ${PDF_NAME_SIZE} !important; }
  .resume-header-flex { ${alignCSS}; flex-wrap:wrap; gap:8px; }
  .resume-section-h2 { ${sectionCSS}; font-size: ${PDF_SECTION_SIZE} !important; }

  /* Override Tailwind text-xs — 9pt is too small for ATS */
  .text-xs { font-size: 10.5pt !important; }
  
  /* Job title */
  .text-sm { font-size: ${PDF_JOBTITLE_SIZE} !important; }
  
  /* Name */
  .text-2xl { font-size: 22pt !important; }

  /* A4 layout */
  @page { size: A4; margin: 0; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
  body { margin: 0; padding: 0; background: white; }
  .resume-page { width: 210mm; min-height: 297mm; background: white; padding: 40px 44px; }
  @media print { .resume-page { width: 210mm; padding: 40px 44px; } }

  /* Spacing */
  .section-gap { margin-bottom: 12px; }
  .section-gap-sm { margin-bottom: 8px; }
  .list-gap > * + * { margin-top: 4px; }
  .list-gap-sm > * + * { margin-top: 2px; }
</style>`;
};
