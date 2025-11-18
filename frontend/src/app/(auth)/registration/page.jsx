'use client';
/**
 * @file page.jsx
 * @description User registration with email verification requirement
 * @author Nozibul Islam
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import RegistrationForm from '@/features/auth/ui/RegistrationForm';
import authApi from '@/features/auth/api/authApi';

export default function RegistrationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegistration = async (formData) => {
    setIsSubmitting(true);

    try {
      const response = await authApi.register(formData);
      console.log('Registration successful:', response);
      
      // Show custom toast with email verification requirement
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-xl rounded-xl pointer-events-auto border border-blue-200`}
        >
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Email Verification Required</h3>
                <p className="text-sm text-gray-600">Welcome! Please verify your email to continue</p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="cursor-pointer flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Email Info */}
            <div className="pl-13 space-y-2">
              <div className="text-sm text-gray-700">
                Verification email sent to: <strong className="text-blue-600">{formData.email}</strong>
              </div>

              {/* Time Warning */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800">
                  <strong>Important:</strong> Verify within <strong>6 hours</strong> or your account will be automatically deleted
                </div>
              </div>
            </div>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-center',
      });

      // Redirect to home
        router.push('/');
      
    } catch (error) {
      console.error('Registration error:', error);
      
      toast.error(
        error.message || 'Registration failed. Please try again.',
        {
          duration: 5000,
          icon: '❌',
          style: {
            borderRadius: '10px',
            background: '#fee2e2',
            color: '#991b1b',
            padding: '16px',
          },
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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