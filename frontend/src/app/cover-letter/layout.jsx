/**
 * @file app/cover-letter/layout.jsx
 * @description Cover letter layout with auth protection
 * @author Nozibul Islam
 *
 * Note: Auth check client-side via Redux — same pattern as
 * resume-builder layout. metadata export করা যাবে না কারণ
 * 'use client' directive আছে।
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useIsAuthenticated,
  useAuthLoading,
} from '@/shared/store/hooks/useAuth';

export default function CoverLetterLayout({ children }) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const loading = useAuthLoading();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/cover-letter');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
