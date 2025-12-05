/**
 * @file (dashboard)/layout.jsx
 * @description Protected dashboard layout with auth verification
 * @author Nozibul Islam
 * 
 * Architecture:
 * - Client component (uses Redux hooks)
 * - Checks authentication on mount
 * - Redirects unauthorized users
 * - Fetches user data if not loaded
 * - Provides consistent dashboard UI (header, sidebar)
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppDispatch } from '@/shared/store/hooks';
import { fetchCurrentUser } from '@/shared/store/slices/authSlice';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAuth();

  // ==========================================
  // AUTH CHECK ON MOUNT
  // ==========================================
  useEffect(() => {
    // If no user in Redux, try to fetch from backend (cookie-based)
    if (!user && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user, loading]);

  // ==========================================
  // REDIRECT LOGIC
  // ==========================================
  useEffect(() => {
    // Wait for loading to finish
    if (loading) return;

    // Not authenticated → Redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Email not verified → Redirect to verification page
    if (user && !user.isEmailVerified) {
      router.push('/verify-email');
      return;
    }
  }, [loading, isAuthenticated, user, router]);

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PROTECTED DASHBOARD UI
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ResumeLetterAI</span>
            </Link>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium hidden sm:block">
                {user.fullName}
              </span>
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-semibold">
                  {user.fullName?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-teal-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              href="/dashboard/resumes"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-teal-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">My Resumes</span>
            </Link>

            <Link
              href="/dashboard/cover-letters"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-teal-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Cover Letters</span>
            </Link>

            <Link
              href="/dashboard/profile"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-teal-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Profile</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}