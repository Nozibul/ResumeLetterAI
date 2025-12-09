/**
 * @file (dashboard)/page.jsx
 * @description Dashboard home page - overview and quick stats
 * @author Nozibul Islam
 * 
 * Features:
 * - Welcome message with user name
 * - Account information display (mapped)
 * - Quick stats cards (mapped)
 * - Quick action cards
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuthUser, useIsAuthenticated } from '@/shared/store/hooks';
import { useRouter } from 'next/navigation';
import { QuickAction } from '@/widgets/dashboard/quickAction/QuickAction';

// ==========================================
// USER INFO CONFIGURATION
// ==========================================
const userInfoConfig = [
  {
    id: '01',
    label: 'Full Name',
    getValue: (user) => user?.fullName || 'N/A',
  },
  {
    id: '02',
    label: 'Email Address',
    getValue: (user) => user?.email || 'N/A',
  },
  {
    id: '03',
    label: 'Account Role',
    getValue: (user) => user?.role || 'user',
    className: 'capitalize',
  },
  {
    id: '04',
    label: 'Email Status',
    getValue: (user) => user?.isEmailVerified,
    isStatus: true,
    statusType: 'verified',
  },
  {
    id: '05',
    label: 'Account Status',
    getValue: (user) => user?.isActive,
    isStatus: true,
    statusType: 'active',
  },
  {
    id: '07',
    label: 'Last Login',
    getValue: (user) => {
      if (!user?.lastLoginAt) return 'N/A';
      const date = new Date(user.lastLoginAt);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  },
  {
    id: '08',
    label: 'Member Since',
    getValue: (user) => {
      if (!user?.createdAt) return 'N/A';
      const date = new Date(user.createdAt);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    },
  },
];

// ==========================================
// STATS CARDS CONFIGURATION
// ==========================================
const statsConfig = [
  {
    id: 'resumes',
    title: 'My Resumes',
    count: 0,
    description: 'No resumes yet',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
    bgColor: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
  {
    id: 'coverLetters',
    title: 'Cover Letters',
    count: 0,
    description: 'No cover letters yet',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 'templates',
    title: 'Templates',
    count: 12,
    description: 'Available templates',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
      />
    ),
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthUser();
  const isAuthenticated = useIsAuthenticated();

  // Welcome message state
  const [showWelcome, setShowWelcome] = useState(true);

  // ==========================================
  // AUTH PROTECTION
  // ==========================================
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // ==========================================
  // WELCOME MESSAGE TIMER
  // ==========================================
  useEffect(() => {
    if (user?.fullName) {
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARD UI
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center">
          {showWelcome && (
            <h1 className="text-3xl font-bold mb-2 transition-opacity duration-1000 text-gray-900">
              Welcome back, {user.fullName}! 👋
            </h1>
          )}
          <p className="text-gray-600 text-lg">
            Ready to create amazing resumes and cover letters?
          </p>
        </div>
      </div>

      {/* Account Information - MAPPED */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Account Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {userInfoConfig.map((info) => (
            <div
              key={info.id}
              className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              <p className="text-sm text-gray-500 mb-1">{info.label}</p>

              {info.isStatus ? (
                info.getValue(user) ? (
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-600 font-medium">
                      {info.statusType === 'verified' ? 'Verified' : 'Active'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-red-600 font-medium">
                      {info.statusType === 'verified' ? 'Not Verified' : 'Inactive'}
                    </span>
                  </div>
                )
              ) : (
                <p className={`text-gray-900 font-medium ${info.className || ''}`}>
                  {info.getValue(user)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats - MAPPED */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsConfig.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <svg
                  className={`w-6 h-6 ${stat.iconColor}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {stat.icon}
                </svg>
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
            <p className="text-sm text-gray-500 mt-2">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <QuickAction />
    </div>
  );
}