"use client";
/**
 * @file reset-password/[token]/page.jsx
 * @description Reset Password Page with token validation
 * @author Nozibul Islam
 */
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KeyRound, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import authApi from '@/features/auth/api/authApi';
import toast from 'react-hot-toast';
import ResetPasswordForm from '@/features/auth/ui/ResetPasswordForm';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;

  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Validate token on page load (optional but good UX)
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false);
        setIsValidating(false);
        return;
      }

      try {
        // Optional: Call backend to verify token validity
        // await authApi.verifyResetToken(token);
        
        // For now, just mark as valid (backend will validate on submit)
        setIsValidToken(true);
      } catch (error) {
        setIsValidToken(false);
        toast.error('Invalid or expired reset link');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // Countdown and redirect after success
  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (isSuccess && countdown === 0) {
      router.push('/login');
    }
  }, [isSuccess, countdown, router]);

  const handleResetPassword = async (formData) => {
    try {
      await authApi.resetPassword(token, {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      // Show success message
      toast.success('Password reset successful! Redirecting to login...', {
        position: 'top-center',
        duration: 5000,
      });

      setIsSuccess(true);
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      const statusCode = error.response?.status;

      // Handle specific errors
      if (statusCode === 400) {
        throw new Error(backendMessage || 'Invalid or expired reset token');
      } else if (statusCode === 404) {
        throw new Error('User not found');
      } else {
        throw new Error(backendMessage || 'Failed to reset password. Please try again.');
      }
    }
  };

  // Loading State - Validating Token
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-600">Validating your reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid Token State
  if (!isValidToken && !isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-2">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Invalid Reset Link</h2>
              <p className="text-gray-600">
                This password reset link is invalid or has expired.
              </p>
              <p className="text-sm text-gray-500">
                Reset links are only valid for <strong>10 minutes</strong>.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Link
                href="/forgot-password"
                className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg transition-colors"
              >
                Request New Reset Link
              </Link>

              <Link
                href="/login"
                className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center font-medium rounded-lg transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Password Reset Successful!</h2>
              <p className="text-gray-600">
                Your password has been successfully updated.
              </p>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Redirecting to login in <span className="font-bold text-lg">{countdown}</span> seconds...
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg transition-colors"
            >
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Form State - Reset Password
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl mb-2">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Reset Your Password</h2>
            <p className="text-gray-500">
              Choose a strong password to secure your account
            </p>
          </div>

          {/* Form */}
          <ResetPasswordForm onSubmit={handleResetPassword} token={token} />

          {/* Back to Login */}
          <div className="text-center pt-2 border-t border-gray-100">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Remember your password? <span className="font-semibold text-blue-600 hover:underline">Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}