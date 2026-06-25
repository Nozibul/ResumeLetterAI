/**
 * @file features/resume-builder/finalize/ui/FinalizeForm.jsx
 * @description Customize & Export form - Step 9
 * @author Nozibul Islam
 *
 * ✅ sectionOrder — Redux connected (reorderSections, resetSectionOrder)
 * ✅ sectionVisibility — debounced save to Redux
 * ✅ customization — fonts, nameStyle, sectionHeadingStyle debounced save
 * ✅ handleSectionHeadingChange — handler for section heading style
 * ✅ useRef initialize — no loop, logout safe
 */

'use client';

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/shared/store/hooks/useAuth';
import { useCurrentResumeData } from '@/shared/store/hooks/useResume';
import {
  reorderSections,
  resetSectionOrder,
  updateCurrentResumeField,
} from '@/shared/store/slices/resumeSlice';
import SectionVisibilityToggles from './SectionVisibilityToggles';
import NameStyleOptions from './NameStyleOptions';
import SectionReorder from './SectionReorder';
import logger from '@/shared/lib/logger';

// ==========================================
// CONSTANTS
// ==========================================
const DEFAULT_SECTION_ORDER = [
  'personalInfo',
  'summary',
  'workExperience',
  'projects',
  'skills',
  'education',
  'competitiveProgramming',
  'certifications',
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
 * Step 9: Customize & Export
 */
function FinalizeForm() {
  const dispatch = useAppDispatch();
  const resumeData = useCurrentResumeData();

  const sectionOrder = useSelector(
    (state) =>
      state.resume.currentResumeData?.sectionOrder || DEFAULT_SECTION_ORDER
  );

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
      {/* CUSTOMIZE HEADER BANNER */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-teal-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-lg" role="img" aria-label="paint">
              🎨
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-900">
              Customize Your Resume Style
            </h4>
            <p className="text-xs text-indigo-700 mt-0.5">
              Personalize fonts, name style, section headings & layout. Changes
              apply to your live preview instantly.
            </p>
          </div>
        </div>
      </div>

      {/* FONT + NAME STYLE + SECTION HEADING STYLE */}
      <NameStyleOptions
        nameStyle={customization.nameStyle}
        sectionHeadingStyle={customization.sectionHeadingStyle}
        fonts={customization.fonts}
        onChange={handleNameStyleChange}
        onSectionHeadingChange={handleSectionHeadingChange}
        onFontChange={handleFontChange}
      />

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
    </div>
  );
}

export default memo(FinalizeForm);
