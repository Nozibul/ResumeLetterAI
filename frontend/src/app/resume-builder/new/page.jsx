/**
 * @file app/resume-builder/new/page.jsx
 * @description Main resume builder page - Create new resume
 * @author Nozibul Islam
 *
 * Features:
 * - 3-column responsive layout (Sidebar, Form, Preview)
 * - Step-based navigation (9 steps)
 * - Real-time preview updates with Redux
 * - Download: save to DB → generate PDF → upload Cloudinary → auto download
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
import { useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';

import apiClient from '../../../shared/lib/api/axios';
import logger from '@/shared/lib/logger';

// ==========================================
// REDUX HOOKS & ACTIONS
// ==========================================
import { useSelectedTemplate } from '@/shared/store/hooks/useTemplates';
import {
  useCurrentResumeData,
  useIsSaving,
} from '@/shared/store/hooks/useResume';
import { setCurrentResumeData } from '@/shared/store/slices/resumeSlice';

// ==========================================
// LAZY LOADED WIDGETS
// ==========================================
const NavigationSidebar = lazy(
  () => import('@/widgets/resume-builder/NavigationSidebar')
);
const FormArea = lazy(() => import('@/widgets/resume-builder/FormArea'));
const LivePreviewContainer = lazy(
  () => import('@/widgets/resume-builder/LivePreview/LivePreviewContainer')
);

// ==========================================
// LOADING SKELETONS
// ==========================================
const SidebarSkeleton = () => (
  <div className="w-64 bg-white border-r border-gray-200 p-6 animate-pulse">
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <div key={i} className="h-12 bg-gray-200 rounded" />
      ))}
    </div>
  </div>
);

const FormSkeleton = () => (
  <div className="flex-1 p-8 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
    <div className="space-y-4">
      <div className="h-12 bg-gray-200 rounded" />
      <div className="h-12 bg-gray-200 rounded" />
      <div className="h-32 bg-gray-200 rounded" />
    </div>
  </div>
);

const PreviewSkeleton = () => (
  <div className="flex-1 bg-gray-100 p-8 animate-pulse">
    <div className="bg-white rounded-lg shadow-lg h-full" />
  </div>
);

// ==========================================
// CONSTANTS
// ==========================================
const INITIAL_RESUME_DATA = {
  personalInfo: {},
  summary: {},
  workExperience: [],
  projects: [],
  skills: {},
  education: [],
  competitiveProgramming: [],
  certifications: [],
  sectionOrder: [
    'personalInfo',
    'summary',
    'workExperience',
    'projects',
    'skills',
    'education',
    'competitiveProgramming',
    'certifications',
  ],
  sectionVisibility: {
    personalInfo: true,
    summary: true,
    workExperience: true,
    projects: true,
    skills: true,
    education: true,
    competitiveProgramming: true,
    certifications: true,
  },
  customization: {
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
    sectionHeadingStyle: {
      position: 'left',
      case: 'uppercase',
      fontWeight: 'bold',
      borderStyle: 'bottom',
    },
  },
};

// ==========================================
// HELPERS
// ==========================================

/**
 * Build safe PDF filename from full name
 * @param {string} fullName
 * @returns {string}
 */
const buildFilename = (fullName) => {
  const safeName = (fullName || 'resume')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${safeName}-resume.pdf`;
};

/**
 * Trigger browser file download from blob
 * @param {Blob} blob
 * @param {string} filename
 */
const triggerDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ==========================================
// COMPONENT
// ==========================================

export default function ResumeBuilderPage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // ==========================================
  // STATE
  // ==========================================
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const templateIdFromQuery = searchParams.get('template');

  // ==========================================
  // REDUX
  // ==========================================
  const resumeData = useCurrentResumeData();
  const selectedTemplate = useSelectedTemplate();
  const isSaving = useIsSaving();

  // ==========================================
  // INITIALIZE REDUX STATE
  // ==========================================
  useEffect(() => {
    dispatch(setCurrentResumeData(INITIAL_RESUME_DATA));
  }, [dispatch]);

  // ==========================================
  // TEMPLATE INIT
  // ==========================================
  useEffect(() => {
    if (templateIdFromQuery && !selectedTemplate) {
      logger.info(
        '[ResumeBuilderPage] Template ID from URL:',
        templateIdFromQuery
      );
    }
  }, [templateIdFromQuery, selectedTemplate]);

  // ==========================================
  // DOWNLOAD HANDLER
  // ① POST /api/v1/resumes    — save JSON → get _id
  // ② POST /api/pdf/generate  — generate PDF → get pdfUrl
  // ③ PATCH /api/v1/resumes/:id — save pdfUrl
  // ④ Auto download trigger
  // ==========================================
  const handleDownload = useCallback(async () => {
    if (!resumeData) {
      logger.error('[handleDownload] No resume data in Redux');
      return;
    }

    if (!templateIdFromQuery) {
      logger.error('[handleDownload] No templateId in URL');
      alert('Template not selected. Please go back and select a template.');
      return;
    }

    setIsDownloading(true);

    try {
      // ① Save resumeJSON to DB
      const saveResponse = await apiClient.post('/resumes', {
        ...resumeData,
        templateId: templateIdFromQuery,
        title: resumeData.personalInfo?.fullName?.trim()
          ? `${resumeData.personalInfo.fullName}'s Resume`
          : 'My Resume',
      });

      const resumeId = saveResponse.data?.data?.resume?._id;

      if (!resumeId) {
        throw new Error('Resume save failed — no ID returned from server');
      }

      // Redux এ _id update করো
      dispatch(setCurrentResumeData({ ...resumeData, _id: resumeId }));

      logger.info('[handleDownload] Resume saved, ID:', resumeId);

      // ② Generate PDF
      const pdfResponse = await apiClient.post(
        '/pdf/generate',
        {
          resumeData,
          customization: resumeData.customization,
          resumeId,
        },
        { responseType: 'blob' }
      );

      const pdfUrl = pdfResponse.headers['x-pdf-url'];
      const pdfPublicId = pdfResponse.headers['x-pdf-publicid'];

      logger.info('[handleDownload] PDF generated, URL:', pdfUrl);

      // ③ pdfUrl MongoDB তে update করো
      if (pdfUrl) {
        await apiClient.patch(`/resumes/${resumeId}`, {
          pdfUrl,
          pdfPublicId,
        });
        logger.info('[handleDownload] pdfUrl saved to DB');
      }

      // ④ Auto download
      const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      const filename = buildFilename(resumeData.personalInfo?.fullName);
      triggerDownload(blob, filename);

      logger.info('[handleDownload] Download complete');
    } catch (error) {
      // Blob response error message extract
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const json = JSON.parse(text);
          logger.error('[handleDownload] PDF error:', json.message);
        } catch {
          logger.error('[handleDownload] PDF error:', text);
        }
      } else {
        logger.error('[handleDownload] Failed:', error);
      }
      alert('PDF generation failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [resumeData, templateIdFromQuery, dispatch]);

  // ==========================================
  // STEP NAVIGATION
  // ==========================================
  const handleNextStep = useCallback(async () => {
    // Last step — trigger download
    if (currentStep === 9) {
      await handleDownload();
      return;
    }

    setCurrentStep((prev) => prev + 1);
    logger.info(`[ResumeBuilderPage] Navigated to step ${currentStep + 1}`);
  }, [currentStep, handleDownload]);

  const handleBackStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      logger.info(
        `[ResumeBuilderPage] Navigated back to step ${currentStep - 1}`
      );
    }
  }, [currentStep]);

  const handleStepClick = useCallback((stepId) => {
    if (stepId >= 1 && stepId <= 9) {
      setCurrentStep(stepId);
      logger.info(`[ResumeBuilderPage] Jumped to step ${stepId}`);
    }
  }, []);

  // ==========================================
  // MOBILE PREVIEW TOGGLE
  // ==========================================
  const toggleMobilePreview = useCallback(() => {
    setIsMobilePreviewOpen((prev) => !prev);
  }, []);

  // ==========================================
  // COMPLETED STEPS (Memoized)
  // ==========================================
  const completedSteps = useMemo(() => {
    if (!resumeData) return [];

    const completed = [];
    if (resumeData.personalInfo?.fullName && resumeData.personalInfo?.email)
      completed.push(1);
    if (resumeData.summary?.text) completed.push(2);
    if (resumeData.workExperience?.length > 0) completed.push(3);
    if (resumeData.projects?.length > 0) completed.push(4);
    if (resumeData.skills?.programmingLanguages?.length > 0) completed.push(5);
    if (resumeData.education?.length > 0) completed.push(6);
    if (resumeData.competitiveProgramming?.length > 0) completed.push(7);
    if (resumeData.certifications?.length > 0) completed.push(8);

    return completed;
  }, [resumeData]);

  // ==========================================
  // PROGRESS (Memoized)
  // ==========================================
  const progress = useMemo(() => {
    return Math.round((completedSteps.length / 9) * 100);
  }, [completedSteps]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* SIDEBAR */}
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

      {/* FORM AREA */}
      <main className="lg:w-[40%] flex-1 overflow-y-auto z-20 relative">
        <Suspense fallback={<FormSkeleton />}>
          <FormArea
            currentStep={currentStep}
            onNext={handleNextStep}
            onBack={handleBackStep}
            onPreviewToggle={toggleMobilePreview}
            isSaving={isSaving || isDownloading}
          />
        </Suspense>
      </main>

      {/* LIVE PREVIEW */}
      <aside
        className={`
          fixed lg:relative inset-y-0 right-0 z-30
          transform lg:transform-none transition-transform duration-300
          ${isMobilePreviewOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          w-full lg:w-[40%] bg-gray-100
        `}
      >
        <Suspense fallback={<PreviewSkeleton />}>
          <LivePreviewContainer
            isMobile={isMobilePreviewOpen}
            onClose={toggleMobilePreview}
          />
        </Suspense>
      </aside>

      {/* MOBILE OVERLAY */}
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
