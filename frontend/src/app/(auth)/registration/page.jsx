/**
 * @file (dashboard)/layout.jsx
 * @description Dashboard with URL access prevention
 * @author Nozibul Islam
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, useAppDispatch } from '@/shared/store/hooks';
import { fetchCurrentUser, logoutUser } from '@/shared/store/slices/authSlice';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    ),
  },
  {
    href: '/dashboard/resumes',
    label: 'My Resumes',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
  },
  {
    href: '/dashboard/cover-letters',
    label: 'Cover Letters',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
  },
  {
    href: '/dashboard/profile',
    label: 'Profile',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),
  },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAuth();

  // URL Access Prevention
  const hasCheckedAccess = useRef(false);
  const [isValidAccess, setIsValidAccess] = useState(false);

  // ==========================================
  // CHECK AUTHENTICATION (NOT SESSION TOKEN)
  // ==========================================
  useEffect(() => {
    if (hasCheckedAccess.current) return;
    hasCheckedAccess.current = true;

    // Wait a bit for Redux to load user data
    const checkAuth = setTimeout(() => {
      // If not authenticated after loading
      if (!loading && !isAuthenticated) {
        toast.error('Please login to access dashboard', {
          duration: 3000,
          position: 'top-center',
          style: {
            borderRadius: '10px',
            background: '#fee2e2',
            color: '#991b1b',
            padding: '16px',
          },
        });

        router.replace('/login');
        return;
      }

      // Authenticated - allow access
      setIsValidAccess(true);
    }, 100);

    return () => clearTimeout(checkAuth);
  }, [loading, isAuthenticated, router]);

  // ==========================================
  // FETCH USER DATA
  // ==========================================
  useEffect(() => {
    if (!user && !loading && isValidAccess) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user, loading, isValidAccess]);

  // ==========================================
  // REDIRECT LOGIC
  // ==========================================
  useEffect(() => {
    if (loading || !isValidAccess) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [loading, isAuthenticated, user, router, isValidAccess]);

  // ==========================================
  // LOGOUT HANDLER
  // ==========================================
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/');
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading || !user || !isValidAccess) {
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
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 z-20">
        <div className="max-w-full mx-auto px-6 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ResumeLetterAI</span>
            </Link>

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

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-64 pl-6 bg-white shadow-md min-h-[calc(100vh-4rem)]"
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 relative cursor-pointer ${
                      isActive
                        ? 'bg-teal-50 text-teal-600 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 rounded-r"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <motion.svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.icon}
                    </motion.svg>

                    <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}

            <div className="-ml-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="ml-4 w-[calc(100%-16px)] px-4 py-2 cursor-pointer bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </nav>
        </motion.aside>

        {/* Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 px-10 py-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
