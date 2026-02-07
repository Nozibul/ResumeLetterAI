/**
 * @file app/(resume-builder)/new/page.jsx
 * @description Main resume builder page - Create new resume
 * @author Nozibul Islam
 *
 * Features:
 * - 3-column responsive layout (Sidebar, Form, Preview)
 * - Step-based navigation (9 steps)
 * - Auto-save functionality
 * - Real-time preview updates
 * - Template selection integration
 *
 */

'use client';

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  lazy,
  Suspense,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import logger from '@/shared/lib/logger';

// ==========================================
// REDUX HOOKS
// ==========================================
// import { useAppDispatch } from '@/store/hooks/useAuth';
import { useSelectedTemplate } from '@/shared/store/hooks/useTemplates';
import {
  useCurrentResumeData,
  useIsSaving,
} from '@/shared/store/hooks/useResume';

// ==========================================
// LAZY LOADED WIDGETS (Performance optimization)
// ==========================================
const NavigationSidebar = lazy(
  () => import('@/widgets/resume-builder/NavigationSidebar')
);
const FormArea = lazy(() => import('@/widgets/resume-builder/FormArea'));
const LivePreview = lazy(() => import('@/widgets/resume-builder/LivePreview'));

// ==========================================
// LOADING SKELETON COMPONENTS
// ==========================================
const SidebarSkeleton = () => (
  <div className="w-64 bg-white border-r border-gray-200 p-6 animate-pulse">
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <div key={i} className="h-12 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

const FormSkeleton = () => (
  <div className="flex-1 p-8 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
    <div className="space-y-4">
      <div className="h-12 bg-gray-200 rounded"></div>
      <div className="h-12 bg-gray-200 rounded"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const PreviewSkeleton = () => (
  <div className="flex-1 bg-gray-100 p-8 animate-pulse">
    <div className="bg-white rounded-lg shadow-lg h-full"></div>
  </div>
);

/**
 * Resume Builder Page Component
 */
export default function ResumeBuilderPage() {
  const router = useRouter();
  // const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // Get template from URL query (if user came from template selection)
  const templateIdFromQuery = searchParams.get('template');

  // Redux state using custom hooks
  const resumeData = useCurrentResumeData();
  const selectedTemplate = useSelectedTemplate();
  const isSaving = useIsSaving();

  // ==========================================
  // TEMPLATE INITIALIZATION
  // ==========================================
  useEffect(() => {
    // If template ID in URL but not in Redux, fetch it
    if (templateIdFromQuery && !selectedTemplate) {
      // Dispatch action to fetch template
      // dispatch(fetchTemplateById(templateIdFromQuery));
      logger.info('Template ID from URL:', templateIdFromQuery);
    }

    // Cleanup
    return () => {
      // No cleanup needed
    };
  }, [templateIdFromQuery, selectedTemplate]);

  // ==========================================
  // STEP NAVIGATION HANDLERS (Memoized)
  // ==========================================
  const handleNextStep = useCallback(() => {
    if (currentStep < 9) {
      setCurrentStep((prev) => prev + 1);
      logger.info(`Navigated to step ${currentStep + 1}`);
    }
  }, [currentStep]);

  const handleBackStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      logger.info(`Navigated back to step ${currentStep - 1}`);
    }
  }, [currentStep]);

  const handleStepClick = useCallback((stepId) => {
    // Validate step ID
    if (stepId >= 1 && stepId <= 9) {
      setCurrentStep(stepId);
      logger.info(`Jumped to step ${stepId}`);
    }
  }, []);

  // ==========================================
  // MOBILE PREVIEW TOGGLE (Memoized)
  // ==========================================
  const toggleMobilePreview = useCallback(() => {
    setIsMobilePreviewOpen((prev) => !prev);
  }, []);

  // ==========================================
  // COMPLETED STEPS CALCULATION (Memoized)
  // ==========================================
  const completedSteps = useMemo(() => {
    if (!resumeData) return [];

    const completed = [];

    // Check each step's completion
    if (resumeData.personalInfo?.fullName && resumeData.personalInfo?.email) {
      completed.push(1);
    }
    if (resumeData.summary?.text) {
      completed.push(2);
    }
    if (resumeData.workExperience?.length > 0) {
      completed.push(3);
    }
    if (resumeData.projects?.length > 0) {
      completed.push(4);
    }
    if (resumeData.skills?.programmingLanguages?.length > 0) {
      completed.push(5);
    }
    if (resumeData.education?.length > 0) {
      completed.push(6);
    }
    // Steps 7, 8 are optional

    return completed;
  }, [resumeData]);

  // ==========================================
  // PROGRESS CALCULATION (Memoized)
  // ==========================================
  const progress = useMemo(() => {
    return Math.round((completedSteps.length / 9) * 100);
  }, [completedSteps]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ==========================================
          SIDEBAR - Navigation (Desktop/Tablet)
          Hidden on mobile, shown as drawer
      ========================================== */}
      <aside className="hidden lg:block">
        <Suspense fallback={<SidebarSkeleton />}>
          <NavigationSidebar
            currentStep={currentStep}
            completedSteps={completedSteps}
            progress={progress}
            onStepClick={handleStepClick}
          />
        </Suspense>
      </aside>

      {/* ==========================================
          MAIN FORM AREA
      ========================================== */}
      <main className="lg:w-[45%] flex-1 overflow-y-auto z-20 relative">
        <Suspense fallback={<FormSkeleton />}>
          <FormArea
            currentStep={currentStep}
            onNext={handleNextStep}
            onBack={handleBackStep}
            onPreviewToggle={toggleMobilePreview}
            isSaving={isSaving}
          />
        </Suspense>
      </main>

      {/* ==========================================
          PREVIEW - Live Resume Preview
          Hidden on mobile (toggle button in FormArea)
          Side-by-side on desktop
      ========================================== */}
      <aside
        className={`
          fixed lg:relative inset-y-0 right-0 z-30
          transform lg:transform-none transition-transform duration-300
          ${isMobilePreviewOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          w-full lg:w-[33%] bg-gray-100
        `}
      >
        <Suspense fallback={<PreviewSkeleton />}>
          <LivePreview
            resumeData={resumeData}
            templateId={selectedTemplate?._id || templateIdFromQuery}
            onClose={toggleMobilePreview}
            isMobile={isMobilePreviewOpen}
          />
        </Suspense>
      </aside>

      {/* ==========================================
          MOBILE OVERLAY (when preview is open)
      ========================================== */}
      {isMobilePreviewOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-25 lg:hidden"
          onClick={toggleMobilePreview}
          aria-label="Close preview"
        />
      )}
    </div>
  );
}
