/**
 * @file features/resume-builder/finalize/ui/FinalizeForm.jsx
 * @description Finalize & Customize form - Step 9 (NO REDUX - LOCAL STATE)
 * @author Nozibul Islam
 */

'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import SectionVisibilityToggles from './SectionVisibilityToggles';
import ColorPicker from './ColorPicker';
import NameStyleOptions from './NameStyleOptions';
import SectionReorder from './SectionReorder';
import logger from '@/shared/lib/logger';

/**
 * FinalizeForm Component
 * Step 9: Finalize & Customize (LOCAL STATE VERSION)
 */
function FinalizeForm() {
  // ==========================================
  // LOCAL STATE (NO REDUX)
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

  // LOCAL STATE for section order
  const [sectionOrder, setSectionOrder] = useState([
    'personalInfo',
    'summary',
    'skills',
    'workExperience',
    'projects',
    'education',
    'competitiveProgramming',
    'certifications',
  ]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleVisibilityToggle = useCallback((section) => {
    setSectionVisibility((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const handleColorChange = useCallback((colorType, value) => {
    setCustomization((prev) => ({
      ...prev,
      colors: { ...prev.colors, [colorType]: value },
    }));
  }, []);

  const handleFontChange = useCallback((fontType, value) => {
    setCustomization((prev) => ({
      ...prev,
      fonts: { ...prev.fonts, [fontType]: value },
    }));
  }, []);

  const handleNameStyleChange = useCallback((styleType, value) => {
    setCustomization((prev) => ({
      ...prev,
      nameStyle: { ...prev.nameStyle, [styleType]: value },
    }));
  }, []);

  // Section reorder handlers (LOCAL STATE)
  const handleSectionReorder = useCallback((newOrder) => {
    setSectionOrder(newOrder);
    logger.info('Section order updated:', newOrder);
  }, []);

  const handleResetSectionOrder = useCallback(() => {
    setSectionOrder([
      'personalInfo',
      'summary',
      'skills',
      'workExperience',
      'projects',
      'education',
      'competitiveProgramming',
      'certifications',
    ]);
    logger.info('Section order reset to default');
  }, []);

  // ==========================================
  // ATS TIPS
  // ==========================================
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
    <div className="space-y-4">
      {/* ATS GUIDELINES */}
      <ATSBanner title="Final ATS Checklist" tips={atsTips} />

      {/* SUCCESS MESSAGE */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg p-4">
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
          <div className="flex-1">
            <h4 className="text-md font-bold text-teal-900 mb-1">
              🎉 Resume Complete!
            </h4>
            <p className="text-sm text-teal-800">
              Your resume is ready. Customize the appearance and section order
              below.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION REORDERING (LOCAL STATE) */}
      <SectionReorder
        sectionOrder={sectionOrder}
        onReorder={handleSectionReorder}
        onReset={handleResetSectionOrder}
      />

      {/* SECTION VISIBILITY */}
      <SectionVisibilityToggles
        visibility={sectionVisibility}
        onToggle={handleVisibilityToggle}
      />

      {/* COLOR PICKER */}
      <ColorPicker colors={customization.colors} onChange={handleColorChange} />

      {/* NAME STYLE & FONTS */}
      <NameStyleOptions
        nameStyle={customization.nameStyle}
        fonts={customization.fonts}
        onChange={handleNameStyleChange}
        onFontChange={handleFontChange}
      />

      {/* DOWNLOAD INFO */}
      <div className="bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="h-6 w-6 text-teal-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-teal-700 mb-2">
              Ready to Download?
            </h3>
            <p className="text-sm text-teal-800 mb-3">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-medium">
                All changes are automatically saved
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(FinalizeForm);
