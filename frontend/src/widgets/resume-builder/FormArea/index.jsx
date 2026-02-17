/**
 * @file widgets/resume-builder/FormArea/index.jsx
 * @description Main form area with dynamic step content
 * @author Nozibul Islam
 *
 * Features:
 * - Dynamic form rendering based on current step
 * - Form header with step title and description
 * - Navigation footer (Back/Next buttons)
 * - Auto-save indicator
 * - Mobile preview toggle
 * - Smooth transitions between steps
 */

'use client';

import { memo, useCallback, useMemo, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import FormHeader from './FormHeader';
import FormFooter from './FormFooter';
import { FORM_STEPS } from '@/shared/lib/constants';
import logger from '@/shared/lib/logger';

// ==========================================
// LAZY LOADED STEP COMPONENTS (Performance)
// ==========================================
const PersonalInfoForm = lazy(
  () => import('@/features/resume-builder/personal-info/ui/PersonalInfoForm')
);
const SummaryForm = lazy(
  () => import('@/features/resume-builder/summary/ui/SummaryForm')
);
const WorkExperienceForm = lazy(
  () =>
    import('@/features/resume-builder/work-experience/ui/WorkExperienceForm')
);
const ProjectsForm = lazy(
  () => import('@/features/resume-builder/projects/ui/ProjectsForm')
);
const SkillsForm = lazy(
  () => import('@/features/resume-builder/skills/ui/SkillsForm')
);
const EducationForm = lazy(
  () => import('@/features/resume-builder/education/ui/EducationForm')
);
const CPForm = lazy(
  () => import('@/features/resume-builder/competitive-programming/ui/CPForm')
);
const CertificationsForm = lazy(
  () => import('@/features/resume-builder/certifications/ui/CertificationsForm')
);
const FinalizeForm = lazy(
  () => import('@/features/resume-builder/finalize/ui/FinalizeForm')
);

// ==========================================
// FORM LOADING SKELETON
// ==========================================
const FormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-12 bg-gray-200 rounded w-3/4"></div>
    <div className="h-12 bg-gray-200 rounded"></div>
    <div className="h-12 bg-gray-200 rounded"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
);

/**
 * FormArea Component
 * Main container for resume builder forms
 */
function FormArea({ currentStep, onNext, onBack, onPreviewToggle, isSaving }) {
  // ==========================================
  // INPUT VALIDATION
  // ==========================================
  const validCurrentStep =
    typeof currentStep === 'number' && currentStep >= 1 && currentStep <= 9
      ? currentStep
      : 1;

  const validIsSaving = typeof isSaving === 'boolean' ? isSaving : false;

  // ==========================================
  // CURRENT STEP DATA (Memoized)
  // ==========================================
  const stepData = useMemo(() => {
    return (
      FORM_STEPS.find((step) => step.id === validCurrentStep) || FORM_STEPS[0]
    );
  }, [validCurrentStep]);

  // ==========================================
  // STEP DESCRIPTIONS (Memoized)
  // ==========================================
  const stepDescriptions = useMemo(
    () => ({
      1: 'Enter your contact information and professional links',
      2: 'Write a brief professional summary (optional)',
      3: 'Add your work experience with key responsibilities',
      4: 'Showcase your projects with technologies used',
      5: 'List your technical skills by category',
      6: 'Add your educational background',
      7: 'Include CP achievements (optional)',
      8: 'Add professional certifications (optional)',
      9: 'Customize your resume and download',
    }),
    []
  );

  // ==========================================
  // RENDER CURRENT STEP FORM (Memoized)
  // ==========================================
  const renderStepForm = useCallback(() => {
    switch (validCurrentStep) {
      case 1:
        return <PersonalInfoForm />;
      case 2:
        return <SummaryForm />;
      case 3:
        return <WorkExperienceForm />;
      case 4:
        return <ProjectsForm />;
      case 5:
        return <SkillsForm />;
      case 6:
        return <EducationForm />;
      case 7:
        return <CPForm />;
      case 8:
        return <CertificationsForm />;
      case 9:
        return <FinalizeForm />;
      default:
        logger.error('Invalid step:', validCurrentStep);
        return <PersonalInfoForm />;
    }
  }, [validCurrentStep]);

  // ==========================================
  // NAVIGATION HANDLERS (Memoized)
  // ==========================================
  const handleNext = useCallback(() => {
    if (typeof onNext === 'function') {
      onNext();
    }
  }, [onNext]);

  const handleBack = useCallback(() => {
    if (typeof onBack === 'function') {
      onBack();
    }
  }, [onBack]);

  const handlePreviewToggle = useCallback(() => {
    if (typeof onPreviewToggle === 'function') {
      onPreviewToggle();
    }
  }, [onPreviewToggle]);

  // ==========================================
  // NAVIGATION BUTTON STATES (Memoized)
  // ==========================================
  const showBackButton = useMemo(
    () => validCurrentStep > 1,
    [validCurrentStep]
  );
  const isLastStep = useMemo(() => validCurrentStep === 9, [validCurrentStep]);
  const nextButtonText = useMemo(() => {
    if (isLastStep) return 'Download Resume';
    const nextStep = FORM_STEPS.find((s) => s.id === validCurrentStep + 1);
    return nextStep ? `Next: ${nextStep.label}` : 'Next';
  }, [isLastStep, validCurrentStep]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="flex flex-col h-full bg-white">
      {/* ==========================================
          FORM HEADER
      ========================================== */}
      <FormHeader
        stepNumber={validCurrentStep}
        stepTitle={stepData.label}
        stepDescription={stepDescriptions[validCurrentStep]}
        isSaving={validIsSaving}
        onPreviewToggle={handlePreviewToggle}
      />

      {/* ==========================================
          FORM CONTENT (Scrollable)
      ========================================== */}
      <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-6">
        <Suspense fallback={<FormSkeleton />}>
          <div
            className="max-w-3xl mx-auto animate-fadeInUp"
            key={validCurrentStep} // Force re-mount on step change for animation
          >
            {renderStepForm()}
          </div>
        </Suspense>
      </div>

      {/* ==========================================
          FORM FOOTER (Navigation)
      ========================================== */}
      <FormFooter
        showBackButton={showBackButton}
        nextButtonText={nextButtonText}
        isLastStep={isLastStep}
        onBack={handleBack}
        onNext={handleNext}
        disabled={validIsSaving}
      />
    </div>
  );
}

// ==========================================
// PROP TYPES
// ==========================================
FormArea.propTypes = {
  currentStep: PropTypes.number.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onPreviewToggle: PropTypes.func,
  isSaving: PropTypes.bool,
};

FormArea.defaultProps = {
  onPreviewToggle: () => {},
  isSaving: false,
};

// ==========================================
// MEMOIZATION
// ==========================================
export default memo(FormArea);
