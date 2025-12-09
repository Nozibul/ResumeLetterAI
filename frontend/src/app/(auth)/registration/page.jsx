'use client';
/**
 * @file page.jsx
 * @description User registration with email verification requirement
 * @author Nozibul Islam
 */

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Clock } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import RegistrationForm from '@/features/auth/ui/RegistrationForm';
import authApi from '@/features/auth/api/authApi';

// Global flag to prevent duplicate registrations across re-renders
let registrationInProgress = false;

export default function RegistrationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidAccess, setIsValidAccess] = useState(false);
  const hasShownToast = useRef(false);
  const hasCheckedAccess = useRef(false);

  // NEW: Check valid navigation on mount
  useEffect(() => {
    if (hasCheckedAccess.current) return;
    hasCheckedAccess.current = true;

    // Check if user came from login
    const navFromLogin = sessionStorage.getItem('nav_from_login');
    const navTimestamp = sessionStorage.getItem('nav_timestamp');

    if (!navFromLogin || navFromLogin !== 'true') {
      // Invalid access
      toast.error('Please use the signup link from the login page', {
        duration: 3000,
        position: 'top-center',
        style: {
          borderRadius: '10px',
          background: '#fee2e2',
          color: '#991b1b',
          padding: '16px',
        },
      });

      // Redirect to login
      router.replace('/login');
      return;
    }

    // Check timestamp - 5 minute validity
    if (navTimestamp) {
      const timestamp = parseInt(navTimestamp);
      const now = Date.now();
      const timeDiff = now - timestamp;
      const fiveMinutes = 5 * 60 * 1000;

      if (timeDiff > fiveMinutes) {
        // Token expired
        console.warn('⚠️ Navigation token expired');
        
        toast.error('Session expired. Please try again.', {
          duration: 3000,
          position: 'top-center',
          style: {
            borderRadius: '10px',
            background: '#fee2e2',
            color: '#991b1b',
            padding: '16px',
          },
        });

        // Clear expired tokens
        sessionStorage.removeItem('nav_from_login');
        sessionStorage.removeItem('nav_timestamp');

        router.replace('/login');
        return;
      }
    }

    // Valid access
    setIsValidAccess(true);

  // Token used — now clear it
  // (so refresh won’t restore access)
    sessionStorage.removeItem('nav_from_login');
    sessionStorage.removeItem('nav_timestamp');

  }, [router]);

  const handleRegistration = async (formData) => {
    setIsSubmitting(true);

    try {
      await authApi.register(formData);
      
      // Only show toast once
      if (!hasShownToast.current) {
        hasShownToast.current = true;
        
        toast.success(
          <div className="space-y-2">
            <div className="font-semibold text-gray-900">Email Verification Required</div>
            <div className="text-sm text-gray-600">
              Verification email sent to: <strong className="text-teal-600">{formData.email}</strong>
            </div>
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
              <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                <strong>Important:</strong> Verify within <strong>30 minutes</strong> or your account will be deleted
              </div>
            </div>
          </div>,
          {
            duration: 5000,
            position: 'top-center',
            id: 'reg-success',
            style: {
              minWidth: '400px',
              padding: '16px',
              background: 'white',
              color: '#1f2937',
              borderRadius: '10px',
              border: '2px solid #3b82f6',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            },
          }
        );
      }
      
      // Redirect after showing toast
      setTimeout(() => {
        router.push('/login');
      }, 1000);
      
    } catch (error) {
      
      toast.error(
        error.message || 'Registration failed. Please try again.',
        {
          duration: 5000,
          position: 'top-center',
          id: 'reg-error',
          style: {
            borderRadius: '10px',
            background: '#fee2e2',
            color: '#991b1b',
            padding: '16px',
          },
        }
      );
      
      // Reset on error
      registrationInProgress = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show nothing while checking access
  if (!isValidAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-gray-500">Verifying access...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-30 -right-40 w-100 h-100 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-30 -left-40 w-90 h-90 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-4">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl mb-2">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500">Join us and start building amazing resumes</p>
          </div>

          {/* Form */}
          <RegistrationForm 
            onSubmit={handleRegistration} 
            isSubmitting={isSubmitting}
          />

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}