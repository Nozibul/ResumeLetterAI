"use client";
/**
 * @file forgot-password/page.jsx
 * @description Forgot Password Page (Using ForgotPasswordForm component)
 * @author Nozibul Islam
 */
import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import authApi from '@/features/auth/api/authApi';
import toast from 'react-hot-toast';
import ForgotPasswordForm from '@/features/auth/ui/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleForgotPassword = async (email) => {
    try {
      const response = await authApi.forgotPassword(email);

      // Show success toast
      toast.success(response.message || 'Reset link sent to your email!', {
        position: 'top-center',
        duration: 5000,
      });

      // Update state for success screen
      setSubmittedEmail(email);
      setIsSubmitted(true);
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      const statusCode = error.response?.status;

      // Handle specific error codes
      if (statusCode === 429) {
        // Rate limiting error
        throw new Error(backendMessage || 'Too many requests. Please try again later.');
      } else if (statusCode === 403) {
        // Account deactivated
        throw new Error('Account is deactivated. Please contact support.');
      } else {
        // For security, don't reveal if email doesn't exist
        // Show success and let backend handle it
        toast.success('If an account exists with this email, you will receive a reset link.', {
          position: 'top-center',
          duration: 5000,
        });
        setSubmittedEmail(email);
        setIsSubmitted(true);
      }
    }
  };

  // Success State
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 flex items-center justify-center p-4">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all duration-300 hover:shadow-3xl">
            {/* Success Icon */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
                <CheckCircle2 className="w-10 h-10 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Check Your Email!</h2>
              <p className="text-gray-600">
                We've sent a password reset link to
              </p>
              <p className="font-semibold text-gray-800 break-all">{submittedEmail}</p>
              <p className="text-sm text-gray-500">
                The link will expire in <strong>10 minutes</strong>. 
                Don't forget to check your spam folder!
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setSubmittedEmail('');
                }}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Send Another Email
              </button>
              
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form State
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all duration-300 hover:shadow-3xl">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl mb-2">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
            <p className="text-gray-500">
              No worries! Enter your email and we'll send you a reset link.
            </p>
          </div>

          {/* Form Component */}
          <ForgotPasswordForm onSubmit={handleForgotPassword} />

          {/* Back to Login */}
          <div className="text-center pt-2 border-t border-gray-100">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}