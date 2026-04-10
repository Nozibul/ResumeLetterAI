/**
 * @file shared/lib/resumeStyles.js
 * @description Shared style utility for resume rendering
 * @author Nozibul Islam
 *
 * Single source of truth for all resume presentation styles.
 * Used by:
 *   - ResumeRenderer (live preview)
 *   - PDF Generator (download)
 *   - AI Analyzer (reads same structure for suggestions)
 *
 * All functions are pure — no side effects, no React dependencies.
 * Pass customization object, get style object back.
 *
 * To add a new style:
 *   1. Add a new export function here
 *   2. Import in ResumeRenderer and/or PDF Generator
 *   No other files need to change.
 */

// ==========================================
// DEFAULTS
// Safe fallbacks — preview never breaks if customization not set
// Change defaults here — applies everywhere automatically
// ==========================================
const DEFAULTS = {
  headingFont: 'Arial',
  bodyFont: 'Arial',
  namePosition: 'center',
  nameCase: 'uppercase',
  nameBold: true,
  sectionPosition: 'left',
  sectionCase: 'uppercase',
  sectionFontWeight: 'bold',
  sectionBorderStyle: 'bottom',
};

// ==========================================
// ALIGNMENT HELPER
// Converts position string → CSS justifyContent value
// Used for flex containers (contact info, social links)
// so they align with name position setting
//
// position: 'left' | 'center' | 'right'
// ==========================================
export function getAlignmentStyle(position) {
  const map = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };
  return { justifyContent: map[position] || 'center' };
}

// ==========================================
// HEADER SECTION STYLE
// Applied to personalInfo <header> element
// Controls: textAlign — drives all child alignment
// All contact info, social links, name follow this alignment
// ==========================================
export function getHeaderStyle(customization) {
  return {
    textAlign: customization?.nameStyle?.position || DEFAULTS.namePosition,
  };
}

// ==========================================
// NAME STYLE
// Applied to personalInfo <h1> (resume owner's name)
// Controls: position, case, bold, heading font, letter spacing
// ==========================================
export function getNameStyle(customization) {
  const n = customization?.nameStyle;
  return {
    textAlign: n?.position || DEFAULTS.namePosition,
    textTransform: n?.case || DEFAULTS.nameCase,
    fontWeight: n?.bold ? 'bold' : 'normal',
    fontFamily: customization?.fonts?.heading || DEFAULTS.headingFont,
    letterSpacing: '0.05em',
  };
}

// ==========================================
// SECTION HEADING STYLE
// Applied to all section <h2> headings
// (PROFESSIONAL SUMMARY, WORK EXPERIENCE, PROJECTS etc.)
// Controls: position, case, fontWeight, borderBottom, fontFamily
//
// Note: Tailwind 'uppercase' class must be removed from all h2 —
//       textTransform is fully controlled here
// ==========================================
export function getSectionHeadingStyle(customization) {
  const s = customization?.sectionHeadingStyle;
  const hasBorder = !s?.borderStyle || s?.borderStyle === 'bottom';

  return {
    fontFamily: customization?.fonts?.heading || DEFAULTS.headingFont,
    textTransform: s?.case || DEFAULTS.sectionCase,
    fontWeight: s?.fontWeight || DEFAULTS.sectionFontWeight,
    textAlign: s?.position || DEFAULTS.sectionPosition,
    borderBottom: hasBorder ? '1px solid #d1d5db' : 'none',
    paddingBottom: hasBorder ? '4px' : '0',
    marginBottom: '4px',
  };
}

// ==========================================
// BODY CONTAINER STYLE
// Applied to the main content <div> wrapping all sections
// Controls: fontSize, lineHeight, body font, italic
//
// fontSize + lineHeight come from useAutoFontSize hook — passed as args
// so this function stays pure (no React dependency)
// ==========================================
export function getBodyStyle(customization, fontSize, lineHeight) {
  return {
    fontSize: fontSize ? `${fontSize}pt` : undefined,
    lineHeight: lineHeight || '1.3',
    fontFamily: customization?.fonts?.body || DEFAULTS.bodyFont,
    fontStyle: customization?.fonts?.italic ? 'italic' : 'normal',
  };
}

// ==========================================
// SECTION VISIBILITY FILTER
// Returns resumeData with invisible sections emptied out
// Used ONLY at point of PDF generation
//
// Why empty instead of delete:
//   ResumeRenderer already handles empty arrays/objects gracefully
//   PDF generator can reuse same rendering logic
//
// Why NOT use for DB save:
//   DB must store full data + visibility flags
//   User can re-enable hidden sections and data must be there
// ==========================================
export function filterByVisibility(resumeData) {
  if (!resumeData) return resumeData;

  const v = resumeData.sectionVisibility;
  if (!v) return resumeData;

  return {
    ...resumeData,
    // personalInfo always visible — ATS requires it
    summary: v.summary !== false ? resumeData.summary : { text: '' },
    workExperience: v.workExperience !== false ? resumeData.workExperience : [],
    projects: v.projects !== false ? resumeData.projects : [],
    skills: v.skills !== false ? resumeData.skills : {},
    education: v.education !== false ? resumeData.education : [],
    competitiveProgramming:
      v.competitiveProgramming !== false
        ? resumeData.competitiveProgramming
        : [],
    certifications: v.certifications !== false ? resumeData.certifications : [],
  };
}
