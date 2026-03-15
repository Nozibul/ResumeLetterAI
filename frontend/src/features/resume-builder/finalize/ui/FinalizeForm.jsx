/**
 * @file features/resume-builder/finalize/ui/FinalizeForm.jsx
 * @description Finalize & Customize form - Step 9
 * @author Nozibul Islam
 *
 * FIXES:
 * ✅ sectionOrder — local state সরিয়ে Redux এ নেওয়া হয়েছে
 * ✅ sectionVisibility — Redux এ save হচ্ছে
 * ✅ customization — Redux এ save হচ্ছে
 * ✅ reorderSections, resetSectionOrder dispatch করা হচ্ছে
 */

'use client';

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import {
  reorderSections,
  resetSectionOrder,
  updateCurrentResumeField,
} from '@/shared/store/slices/resumeSlice';
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import SectionVisibilityToggles from './SectionVisibilityToggles';
import ColorPicker from './ColorPicker';
import NameStyleOptions from './NameStyleOptions';
import SectionReorder from './SectionReorder';
import logger from '@/shared/lib/logger';

// ==========================================
// CONSTANTS
// ==========================================
const ATS_TIPS = [
  'Keep colors professional (black, navy, dark gray)',
  'Use ATS-safe fonts (Arial, Helvetica, Calibri)',
  'Avoid images, graphics, or complex formatting',
  'Ensure all sections are visible for ATS scanning',
  'Use standard section names for better parsing',
];

const INITIAL_VISIBILITY = {
  personalInfo: true,
  summary: true,
  workExperience: true,
  projects: true,
  skills: true,
  education: true,
  competitiveProgramming: true,
  certifications: true,
};

const INITIAL_CUSTOMIZATION = {
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
};

/**
 * FinalizeForm Component
 * Step 9: Finalize & Customize
 */
function FinalizeForm() {
  const dispatch = useDispatch();
  const resumeData = useCurrentResumeData();

  // sectionOrder — Redux থেকে নেওয়া
  const sectionOrder = useSelector((state) => state.resume.sectionOrder);

  // ==========================================
  // LOCAL STATE — visibility & customization
  // ==========================================
  const [sectionVisibility, setSectionVisibility] =
    useState(INITIAL_VISIBILITY);
  const [customization, setCustomization] = useState(INITIAL_CUSTOMIZATION);
  const [isTouched, setIsTouched] = useState(false);

  // ==========================================
  // INITIALIZE — visibility & customization from Redux
  // ==========================================
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    if (!resumeData) return;

    if (
      resumeData.sectionVisibility &&
      Object.keys(resumeData.sectionVisibility).length > 0
    ) {
      setSectionVisibility(resumeData.sectionVisibility);
    }

    if (
      resumeData.customization &&
      Object.keys(resumeData.customization).length > 0
    ) {
      setCustomization(resumeData.customization);
    }

    hasInitialized.current = true;
  }, [resumeData]);

  // ==========================================
  // DEBOUNCED SAVE — visibility & customization
  // ==========================================
  useEffect(() => {
    if (!isTouched) return;

    const timer = setTimeout(() => {
      dispatch(
        updateCurrentResumeField({
          field: 'sectionVisibility',
          value: sectionVisibility,
        })
      );
      dispatch(
        updateCurrentResumeField({
          field: 'customization',
          value: customization,
        })
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [sectionVisibility, customization, isTouched, dispatch]);

  // ==========================================
  // SECTION ORDER HANDLERS — Redux dispatch
  // ==========================================
  const handleSectionReorder = useCallback(
    (newOrder) => {
      dispatch(
        reorderSections({
          fromIndex: newOrder.fromIndex,
          toIndex: newOrder.toIndex,
        })
      );
      logger.info('Section reordered in Redux');
    },
    [dispatch]
  );

  const handleResetSectionOrder = useCallback(() => {
    dispatch(resetSectionOrder());
    logger.info('Section order reset in Redux');
  }, [dispatch]);

  // ==========================================
  // VISIBILITY HANDLERS
  // ==========================================
  const handleVisibilityToggle = useCallback((section) => {
    setSectionVisibility((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
    setIsTouched(true);
  }, []);

  // ==========================================
  // CUSTOMIZATION HANDLERS
  // ==========================================
  const handleColorChange = useCallback((colorType, value) => {
    setCustomization((prev) => ({
      ...prev,
      colors: { ...prev.colors, [colorType]: value },
    }));
    setIsTouched(true);
  }, []);

  const handleFontChange = useCallback((fontType, value) => {
    setCustomization((prev) => ({
      ...prev,
      fonts: { ...prev.fonts, [fontType]: value },
    }));
    setIsTouched(true);
  }, []);

  const handleNameStyleChange = useCallback((styleType, value) => {
    setCustomization((prev) => ({
      ...prev,
      nameStyle: { ...prev.nameStyle, [styleType]: value },
    }));
    setIsTouched(true);
  }, []);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-4">
      <ATSBanner title="Final ATS Checklist" tips={ATS_TIPS} />

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

      {/* SECTION REORDERING — Redux connected */}
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
