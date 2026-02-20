/**
 * @file app/(resume-builder)/page.jsx
 * @description Resume builder root redirect with security and UX
 * @author Nozibul Islam
 *
 * Features:
 * - Automatic redirect to /new with template preservation
 * - Loading state during redirect
 * - Template ID validation (MongoDB ObjectId format)
 * - Error handling for invalid templates
 * - Analytics tracking ready
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import logger from '@/shared/lib/logger';

/**
 * ResumeBuilderRoot Component
 * Redirects to appropriate builder route with template preservation
 */
export default function ResumeBuilderRoot() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // ==========================================
  // TEMPLATE ID VALIDATION (Security)
  // ==========================================

  /**
   * Validate MongoDB ObjectId format
   * @param {string} id - Template ID
   * @returns {boolean} - true if valid
   */
  const isValidTemplateId = useCallback((id) => {
    if (!id || typeof id !== 'string') return false;

    // MongoDB ObjectId: 24 hex characters
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }, []);

  // ==========================================
  // REDIRECT LOGIC
  // ==========================================

  useEffect(() => {
    // Prevent multiple redirects
    if (isRedirecting) return;

    const performRedirect = async () => {
      try {
        setIsRedirecting(true);

        // Get template ID from URL query
        const templateId =
          searchParams.get('templateId') || searchParams.get('template');

        // ==========================================
        // CASE 1: Template ID provided
        // ==========================================
        if (templateId) {
          // Validate template ID format (Security check)
          if (!isValidTemplateId(templateId)) {
            logger.warn('Invalid template ID format:', templateId);
            setError('Invalid template ID. Redirecting to default builder...');

            // Redirect to /new without template after 2 seconds
            setTimeout(() => {
              router.replace('/resume-builder/new');
            }, 2000);
            return;
          }

          // Valid template - redirect with template parameter
          logger.info('Redirecting to builder with template:', templateId);
          router.replace(`/resume-builder/new?template=${templateId}`);
          return;
        }

        // ==========================================
        // CASE 2: No template ID - default redirect
        // ==========================================
        logger.info('Redirecting to default builder (no template)');
        router.replace('/resume-builder/new');
      } catch (err) {
        // Handle unexpected errors
        logger.error('Redirect error:', err);
        setError('Something went wrong. Redirecting...');

        // Fallback redirect after error
        setTimeout(() => {
          router.replace('/resume-builder/new');
        }, 2000);
      }
    };

    performRedirect();

    // Cleanup
    return () => {
      // No cleanup needed
    };
  }, [router, searchParams, isValidTemplateId, isRedirecting]);

  // ==========================================
  // RENDER - Loading/Error State
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          // Error state
          <>
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-2">{error}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              <span>Redirecting...</span>
            </div>
          </>
        ) : (
          // Loading state
          <>
            <div className="mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
            <p className="text-gray-700 font-medium mb-2">
              Preparing Resume Builder...
            </p>
            <p className="text-sm text-gray-500">
              Please wait while we set things up
            </p>
          </>
        )}
      </div>
    </div>
  );
}
