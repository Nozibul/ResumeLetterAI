/**
 * @file (dashboard)/page.jsx
 * @description Dashboard home page - overview and quick stats
 * @author Nozibul Islam
 * 
 * Features:
 * - Welcome message with user name
 * - Account information display
 * - Quick action cards
 * - Stats placeholders (for future resume/cover letter counts)
 */

'use client';

import { useEffect } from 'react';
import { useAuthUser, useAppDispatch, useIsAuthenticated } from '@/shared/store/hooks';
import { logoutUser } from '@/shared/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthUser(); 
  const isAuthenticated = useIsAuthenticated();
  const dispatch = useAppDispatch();

  // ✅ Add protection
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // ✅ Loading state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Checking authentication...</div>
      </div>
    );
  }

  // ==========================================
  // LOGOUT HANDLER
  // ==========================================
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even on error, redirect to home
      router.push('/');
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.fullName}! 👋
            </h1>
            <p className="text-gray-600">
              Ready to create amazing resumes and cover letters?
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Full Name</p>
            <p className="text-gray-900 font-medium">{user?.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Email Address</p>
            <p className="text-gray-900 font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Account Role</p>
            <p className="text-gray-900 font-medium capitalize">{user?.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Email Status</p>
            <div className="flex items-center space-x-2">
              {user?.isEmailVerified ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-green-600 font-medium">Verified</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span className="text-yellow-600 font-medium">Pending</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">My Resumes</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-500 mt-2">No resumes yet</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Cover Letters</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-500 mt-2">No cover letters yet</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Templates</h3>
          <p className="text-3xl font-bold text-gray-900">12</p>
          <p className="text-sm text-gray-500 mt-2">Available templates</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/resumes/new"
            className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all group"
          >
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-500 transition-colors">
              <svg className="w-6 h-6 text-teal-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Create New Resume</h3>
              <p className="text-sm text-gray-500">Start building your resume</p>
            </div>
          </Link>

          <Link
            href="/dashboard/cover-letters/new"
            className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <svg className="w-6 h-6 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Write Cover Letter</h3>
              <p className="text-sm text-gray-500">Create a new cover letter</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
