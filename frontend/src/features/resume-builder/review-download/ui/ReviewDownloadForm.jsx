/**
 * @file features/resume-builder/review-download/ui/ReviewDownloadForm.jsx
 * @description Review & Download form - Step 10
 * @author Nozibul Islam
 *
 * ✅ sectionOrder — Redux connected (reorderSections, resetSectionOrder)
 * ✅ sectionVisibility — debounced save to Redux
 * ✅ ATS Checklist — final review tips
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
import ATSBanner from '@/shared/components/atoms/resume/ATSBanner';
import SectionVisibilityToggles from '../../finalize/ui/SectionVisibilityToggles';
import SectionReorder from '../../finalize/ui/SectionReorder';
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

/**
 * ReviewDownloadForm Component
 * Step 10: Review & Download
 */
function ReviewDownloadForm() {
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
  const [isTouched, setIsTouched] = useState(false);

  // ==========================================
  // INITIALIZE FROM REDUX — once only
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
      logger.info('[ReviewDownloadForm] Saved visibility to Redux');
    }, 500);

    return () => clearTimeout(timer);
  }, [sectionVisibility, isTouched, dispatch]);

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
  // RENDER
  // ==========================================
  return (
    <div className="space-y-5">
      {/* REVIEW HEADER BANNER */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-lg" role="img" aria-label="review">
              📋
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900">
              Review & Finalize Your Resume
            </h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Reorder sections, toggle visibility & review ATS tips before
              downloading.
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
              Your resume is ready. Click &quot;Download Resume&quot; below to
              export.
            </p>
          </div>
        </div>
      </div>

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
              Click the &quot;Download Resume&quot; button below or use the
              preview panel to export as PDF.
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

export default memo(ReviewDownloadForm);
