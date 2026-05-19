'use client';
/**
 * @file (dashboard)/page.jsx
 * @description Dashboard home page
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * Stats:
 * - resumes: from useResumeStats() — real data from Redux (fetched on mount)
 * - coverLetters: reserved for future coverLetter slice
 * - templates: static (12 available — from statsConfig)
 *
 * Auth protection is handled entirely by DashboardLayout.
 * This page assumes user is always present when rendered.
 */

import { useEffect, useState } from 'react';
import { QuickAction } from '@/widgets/dashboard/quickAction/QuickAction';
import { statsConfig } from '@/local-data/statsConfig';
import { DeleteAccountModal } from '@/widgets/dashboard/deleteAccountModal/DeleteAccountModal';
import { useAuthUser } from '@/shared/store/hooks/useAuth';
import {
  useResumeStats,
  useIsResumesCached,
} from '@/shared/store/hooks/useResume';
import { useAppDispatch } from '@/shared/store/hooks/useAuth';
import { fetchAllResumes } from '@/shared/store/actions/resumeActions';

// ── User info config ──────────────────────────────────────────────────────────

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
      return new Date(user.lastLoginAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
  {
    id: '07',
    label: 'Member Since',
    getValue: (user) => {
      if (!user?.createdAt) return 'N/A';
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Map live stats to statsConfig ids.
 * - resumes   → real total from Redux
 * - coverLetters → reserved (always 0 until slice exists)
 * - templates → static count from statsConfig
 */
const resolveStatCount = (stat, resumeStats) => {
  switch (stat.id) {
    case 'resumes':
      return resumeStats?.total ?? stat.count;
    case 'coverLetters':
      return stat.count; // static until coverLetter slice is ready
    case 'templates':
      return stat.count; // static
    default:
      return stat.count;
  }
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAuthUser();
  const resumeStats = useResumeStats();
  const isCached = useIsResumesCached();

  const [showWelcome, setShowWelcome] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch resumes on mount if not cached
  useEffect(() => {
    if (!isCached) {
      dispatch(fetchAllResumes());
    }
  }, [dispatch, isCached]);

  // Hide welcome banner after 5 seconds
  useEffect(() => {
    if (!user?.fullName) return;
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, [user?.fullName]);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center">
          {showWelcome && (
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              Welcome back, {user?.fullName}! 👋
            </h1>
          )}
          <p className="text-gray-600 text-lg">
            Ready to create amazing resumes and cover letters?
          </p>
        </div>
      </div>

      {/* Account Information */}
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
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-600 font-medium">
                      {info.statusType === 'verified' ? 'Verified' : 'Active'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-red-600 font-medium">
                      {info.statusType === 'verified'
                        ? 'Not Verified'
                        : 'Inactive'}
                    </span>
                  </div>
                )
              ) : (
                <p
                  className={`text-gray-900 font-medium ${info.className || ''}`}
                >
                  {info.getValue(user)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsConfig.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
              >
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
            <h3 className="text-gray-500 text-sm font-medium mb-1">
              {stat.title}
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {resolveStatCount(stat, resumeStats)}
            </p>
            <p className="text-sm text-gray-500 mt-2">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <QuickAction />

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-600 mb-1">
              Danger Zone
            </h3>
            <p className="text-gray-600 mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
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

      {/* Delete Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
