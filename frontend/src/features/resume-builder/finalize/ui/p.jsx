/**
 * @file features/resume-builder/finalize/ui/FinalizeForm.jsx
 * @description Finalize & Customize form - Step 9 (Final Step)
 * @author Nozibul Islam
 *
 * Features:
 * - Section visibility toggles
 * - Section order (drag-drop placeholder)
 * - Template selection preview
 * - Color picker (ATS-safe colors)
 * - Font selector
 * - Name style customization
 * - Download preview
 *
 */

'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import {
  updateCurrentResumeField,
  setIsSaving,
} from '@/shared/store/slices/resumeSlice';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import { ATS_SAFE_COLORS } from '@/shared/lib/constants';

function FinalizeForm() {
  const dispatch = useDispatch();
  const resumeData = useCurrentResumeData();

  // ==========================================
  // LOCAL STATE
  // ==========================================
  const [sectionVisibility, setSectionVisibility] = useState({
    personalInfo: true,
    summary: true,
    workExperience: true,
    projects: true,
    skills: true,
    education: true,
    competitiveProgramming: true,
    certifications: true,
  });

  const [customization, setCustomization] = useState({
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#0066CC',
    },
    fonts: {
      heading: 'Arial',
      body: 'Arial',
    },
    nameStyle: {
      position: 'center',
      case: 'uppercase',
      bold: true,
    },
  });

  const [touched, setTouched] = useState(false);

  // ==========================================
  // INITIALIZE FROM REDUX
  // ==========================================
  useEffect(() => {
    if (resumeData?.sectionVisibility) {
      setSectionVisibility(resumeData.sectionVisibility);
    }
    if (resumeData?.customization) {
      setCustomization(resumeData.customization);
    }
  }, []);

  // ==========================================
  // DEBOUNCED SAVE
  // ==========================================
  useEffect(() => {
    if (!touched) return;

    const timer = setTimeout(() => {
      dispatch(setIsSaving(true));

      // Save section visibility
      dispatch(
        updateCurrentResumeField({
          field: 'sectionVisibility',
          value: sectionVisibility,
        })
      );

      // Save customization
      dispatch(
        updateCurrentResumeField({
          field: 'customization',
          value: customization,
        })
      );

      setTimeout(() => dispatch(setIsSaving(false)), 500);
    }, 500);

    return () => clearTimeout(timer);
  }, [sectionVisibility, customization, touched, dispatch]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleVisibilityToggle = useCallback((section) => {
    setSectionVisibility((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
    setTouched(true);
  }, []);

  const handleColorChange = useCallback((colorType, value) => {
    setCustomization((prev) => ({
      ...prev,
      colors: { ...prev.colors, [colorType]: value },
    }));
    setTouched(true);
  }, []);

  const handleFontChange = useCallback((fontType, value) => {
    setCustomization((prev) => ({
      ...prev,
      fonts: { ...prev.fonts, [fontType]: value },
    }));
    setTouched(true);
  }, []);

  const handleNameStyleChange = useCallback((styleType, value) => {
    setCustomization((prev) => ({
      ...prev,
      nameStyle: { ...prev.nameStyle, [styleType]: value },
    }));
    setTouched(true);
  }, []);

  // ==========================================
  // SECTION DEFINITIONS
  // ==========================================
  const sections = [
    { key: 'personalInfo', label: 'Personal Information', icon: '👤' },
    { key: 'summary', label: 'Professional Summary', icon: '📝' },
    { key: 'workExperience', label: 'Work Experience', icon: '💼' },
    { key: 'projects', label: 'Projects', icon: '🚀' },
    { key: 'skills', label: 'Technical Skills', icon: '⚡' },
    { key: 'education', label: 'Education', icon: '🎓' },
    {
      key: 'competitiveProgramming',
      label: 'Competitive Programming',
      icon: '🏆',
    },
    { key: 'certifications', label: 'Certifications', icon: '📜' },
  ];

  const atsSafeFonts = [
    'Arial',
    'Helvetica',
    'Calibri',
    'Times New Roman',
    'Georgia',
  ];

  const atsTips = [
    'Keep colors professional (black, navy, dark gray)',
    'Use ATS-safe fonts (Arial, Helvetica, Calibri)',
    'Avoid images, graphics, or complex formatting',
    'Ensure all sections are visible for ATS scanning',
    'Use standard section names for better parsing',
  ];

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ATS GUIDELINES */}
      <ATSBanner title="Final ATS Checklist" tips={atsTips} />

      {/* SUCCESS MESSAGE */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="h-6 w-6 text-teal-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-teal-900 mb-1">
              🎉 Resume Complete!
            </h4>
            <p className="text-xs text-teal-800">
              Your resume is ready. Customize the appearance below and download
              when ready.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION VISIBILITY */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Section Visibility
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Toggle which sections appear in your resume
        </p>

        <div className="space-y-3">
          {sections.map((section) => (
            <label
              key={section.key}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{section.icon}</span>
                <span className="text-sm font-medium text-gray-900">
                  {section.label}
                </span>
              </div>
              <input
                type="checkbox"
                checked={sectionVisibility[section.key]}
                onChange={() => handleVisibilityToggle(section.key)}
                className="w-5 h-5 accent-teal-600 border-gray-200 focus:ring-teal-500"
              />
            </label>
          ))}
        </div>
      </div>

      {/* COLOR CUSTOMIZATION */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Color Scheme <span className="text-xs text-gray-500">(ATS-Safe)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <select
              value={customization.colors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {ATS_SAFE_COLORS.map((color, idx) => (
                <option key={`${color.hex}-${idx}`} value={color.hex}>
                  {color.name}
                </option>
              ))}
            </select>
            <div
              className="mt-2 h-10 rounded border border-gray-300"
              style={{ backgroundColor: customization.colors.primary }}
            ></div>
          </div>

          {/* Secondary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <select
              value={customization.colors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {ATS_SAFE_COLORS.map((color, idx) => (
                <option key={`${color.hex}-${idx}`} value={color.hex}>
                  {color.name}
                </option>
              ))}
            </select>
            <div
              className="mt-2 h-10 rounded border border-gray-300"
              style={{ backgroundColor: customization.colors.secondary }}
            ></div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            <select
              value={customization.colors.accent}
              onChange={(e) => handleColorChange('accent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {ATS_SAFE_COLORS.map((color, idx) => (
                <option key={`${color.hex}-${idx}`} value={color.hex}>
                  {color.name}
                </option>
              ))}
            </select>
            <div
              className="mt-2 h-10 rounded border border-gray-300"
              style={{ backgroundColor: customization.colors.accent }}
            ></div>
          </div>
        </div>
      </div>

      {/* FONT CUSTOMIZATION */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Font Selection{' '}
          <span className="text-xs text-gray-500">(ATS-Safe)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Heading Font */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heading Font
            </label>
            <select
              value={customization.fonts.heading}
              onChange={(e) => handleFontChange('heading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {atsSafeFonts.map((font) => (
                <option key={font} value={font}>
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
              value={customization.fonts.body}
              onChange={(e) => handleFontChange('body', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {atsSafeFonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* NAME STYLE */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Name Style</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <select
              value={customization.nameStyle.position}
              onChange={(e) =>
                handleNameStyleChange('position', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          {/* Case */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Letter Case
            </label>
            <select
              value={customization.nameStyle.case}
              onChange={(e) => handleNameStyleChange('case', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="normal">Normal</option>
              <option value="uppercase">UPPERCASE</option>
              <option value="capitalize">Capitalize</option>
            </select>
          </div>

          {/* Bold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Weight
            </label>
            <select
              value={customization.nameStyle.bold ? 'bold' : 'normal'}
              onChange={(e) =>
                handleNameStyleChange('bold', e.target.value === 'bold')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
            </select>
          </div>
        </div>
      </div>

      {/* DOWNLOAD INFO */}
      <div className="bg-gradient-to-r from-teal-50 to-teal-50 border border-teal-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ready to Download?
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          Your resume is complete! Use the "Download" button in the preview
          panel to export as PDF or DOCX.
        </p>
        <div className="flex items-center gap-2 text-sm text-teal-700">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>All changes are automatically saved</span>
        </div>
      </div>
    </div>
  );
}

// export default memo(FinalizeForm);
