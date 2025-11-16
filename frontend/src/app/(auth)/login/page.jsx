"use client";
/**
 * @file page.jsx
 * @author Nozibul Islams
 */
import { LogIn } from 'lucide-react';
import LoginForm from '@/features/auth/ui/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  const handleLogin = async (formData) => {
    // API call will go here
    console.log('Login data:', formData);
    
    // Simulate API call
    setTimeout(() => {
      alert('Login successful! Check console for data.');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all duration-300 hover:shadow-3xl">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl mb-2">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
            <p className="text-gray-500">Login to continue building amazing resumes</p>
          </div>

          {/* Form */}
          <LoginForm onSubmit={handleLogin} />

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600">
            New user?{' '}
            <Link 
              href="/registration" 
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}