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
 * - Delete account functionality (temporary - will move to profile page)
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuthUser, useIsAuthenticated } from '@/shared/store/hooks';
import { useRouter } from 'next/navigation';
import { QuickAction } from '@/widgets/dashboard/quickAction/QuickAction';
import { statsConfig } from '@/local-data/statsConfig';
import { DeleteAccountModal } from '@/widgets/dashboard/deleteAccountModal/DeleteAccountModal';

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
    id: '06',
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
    id: '07',
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


export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthUser();
  const isAuthenticated = useIsAuthenticated();

  // State management
  const [showWelcome, setShowWelcome] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

      {/* ==========================================
          DANGER ZONE - Delete Account
          ========================================== */}
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
        <div className="flex items-start space-x-3">
          {/* Warning Icon */}
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-600 mb-1">Danger Zone</h3>
            <p className="text-gray-600 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}