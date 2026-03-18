/**
 * @file features/resume-builder/finalize/ui/FinalizeForm.jsx
 * @description Finalize & Customize form - Step 9
 * @author Nozibul Islam
 *
 * ✅ sectionOrder — Redux connected (reorderSections, resetSectionOrder)
 * ✅ sectionVisibility — debounced save to Redux
 * ✅ customization — fonts, nameStyle, sectionHeadingStyle debounced save
 * ✅ handleSectionHeadingChange — new handler for section heading style
 * ✅ useRef initialize — no loop, logout safe
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
    italic: false,
  },
  nameStyle: {
    position: 'center',
    case: 'uppercase',
    bold: true,
  },
  // Section headings style (SUMMARY, WORK EXPERIENCE etc.)
  sectionHeadingStyle: {
    position: 'left',
    case: 'uppercase',
    fontWeight: 'bold',
    borderStyle: 'bottom',
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
  // LOCAL STATE
  // ==========================================
  const [sectionVisibility, setSectionVisibility] =
    useState(INITIAL_VISIBILITY);
  const [customization, setCustomization] = useState(INITIAL_CUSTOMIZATION);
  const [isTouched, setIsTouched] = useState(false);

  // ==========================================
  // INITIALIZE FROM REDUX — once only
  // useRef — no re-render, logout/re-login safe
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
      // Merge with INITIAL_CUSTOMIZATION — ensures new fields (sectionHeadingStyle)
      // exist even if loaded from older saved data that didn't have them
      setCustomization({
        ...INITIAL_CUSTOMIZATION,
        ...resumeData.customization,
        sectionHeadingStyle: {
          ...INITIAL_CUSTOMIZATION.sectionHeadingStyle,
          ...resumeData.customization.sectionHeadingStyle,
        },
      });
    }

    hasInitialized.current = true;
  }, [resumeData]);

  // ==========================================
  // DEBOUNCED SAVE TO REDUX
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
      logger.info('[FinalizeForm] Saved customization to Redux');
    }, 500);

    return () => clearTimeout(timer);
  }, [sectionVisibility, customization, isTouched, dispatch]);

  // ==========================================
  // SECTION ORDER HANDLERS
  // ==========================================
  const handleSectionReorder = useCallback(
    (newOrder) => {
      dispatch(
        reorderSections({
          fromIndex: newOrder.fromIndex,
          toIndex: newOrder.toIndex,
        })
      );
    },
    [dispatch]
  );

  const handleResetSectionOrder = useCallback(() => {
    dispatch(resetSectionOrder());
  }, [dispatch]);

  // ==========================================
  // VISIBILITY HANDLER
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

  // Section heading style handler (SUMMARY, WORK EXPERIENCE etc.)
  const handleSectionHeadingChange = useCallback((styleType, value) => {
    setCustomization((prev) => ({
      ...prev,
      sectionHeadingStyle: { ...prev.sectionHeadingStyle, [styleType]: value },
    }));
    setIsTouched(true);
  }, []);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-5">
      {/* ATS CHECKLIST */}
      <ATSBanner title="Final ATS Checklist" tips={ATS_TIPS} />

      {/* SUCCESS BANNER */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <svg
              className="h-5 w-5 text-teal-600"
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
          </div>
          <div>
            <h4 className="text-sm font-bold text-teal-900">
              🎉 Resume Complete!
            </h4>
            <p className="text-xs text-teal-700 mt-0.5">
              Customize appearance and section order below, then download.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION REORDER */}
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

      {/* FONT + NAME STYLE + SECTION HEADING STYLE */}
      <NameStyleOptions
        nameStyle={customization.nameStyle}
        sectionHeadingStyle={customization.sectionHeadingStyle}
        fonts={customization.fonts}
        onChange={handleNameStyleChange}
        onSectionHeadingChange={handleSectionHeadingChange}
        onFontChange={handleFontChange}
      />

      {/* DOWNLOAD INFO */}
      <div className="bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-200 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <svg
              className="h-5 w-5 text-teal-600"
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
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-teal-800 mb-1">
              Ready to Download?
            </h3>
            <p className="text-xs text-teal-700 mb-3">
              Use the Download button in the preview panel to export as PDF or
              DOCX.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-600">
              <svg
                className="h-4 w-4"
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
