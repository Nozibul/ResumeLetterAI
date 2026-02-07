/**
 * @file app/(resume-builder)/layout.jsx
 * @description Main layout for resume builder with 3-column responsive design
 * @author Nozibul Islam
 *
 * Features:
 * - 3-column layout (Sidebar, Form, Preview)
 * - Responsive breakpoints (desktop/tablet/mobile)
 * - Error boundary for crash prevention
 * - Authentication guard
 * - Metadata for SEO
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ErrorBoundary from '@/app/providers/ErrorBoundary';
import logger from '@/shared/lib/logger';
import {
  useIsAuthenticated,
  useAuthLoading,
} from '@/shared/store/hooks/useAuth';
import { ResumeFooter } from '@/shared/components/atoms/resumeFooter/ResumeFooter';

/**
 * Resume Builder Layout
 * Wraps all resume builder pages with consistent structure
 */
export default function ResumeBuilderLayout({ children }) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const loading = useAuthLoading();
  // ==========================================
  // AUTHENTICATION CHECK
  // ==========================================
  useEffect(() => {
    // Wait for auth state to load
    if (loading) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      logger.warn('Unauthenticated access attempt to resume builder');
      router.push('/login?redirect=/resume-builder/new');
    }

    // Cleanup function (prevent memory leaks)
    return () => {
      // No cleanup needed for this effect
    };
  }, [isAuthenticated, loading, router]);

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // UNAUTHENTICATED STATE
  // ==========================================
  if (!isAuthenticated) {
    // Return null while redirecting (prevents flash of content)
    return null;
  }

  // ==========================================
  // MAIN LAYOUT
  // ==========================================
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* 
          Main Container
          - Desktop: 3-column layout
          - Tablet: Collapsible sidebar
          - Mobile: Stacked layout with toggle
        */}
        <div className="h-screen overflow-hidden">
          {/* Error boundary wraps all children */}
          {children}
        </div>

        <ResumeFooter />
      </div>
    </ErrorBoundary>
  );
}

/**
 * Metadata for SEO (static export)
 * Note: This only works in app directory route segments
 */
// export const metadata = {
//   title: 'Resume Builder | Create Professional IT Resume',
//   description:
//     'Build ATS-friendly IT resumes with our step-by-step builder. Optimized for software developers, engineers, and tech professionals.',
//   keywords:
//     'resume builder, IT resume, ATS resume, developer resume, tech resume',
// };
