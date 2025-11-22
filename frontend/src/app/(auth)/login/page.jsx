"use client";
/**
 * @file page.jsx
 * @author Nozibul Islams
 */
import { LogIn } from 'lucide-react';
import LoginForm from '@/features/auth/ui/LoginForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authApi from '@/features/auth/api/authApi';


export default function LoginPage() {
  const router = useRouter();

const handleLogin = async (formData) => {
  try {
    await authApi.login({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe
    });

    router.push('/');

  } catch (error) {
    const backendMessage = error.response?.data?.message;
    
    // Fallback messages based on status code
    const fallbackMessages = {
      401: 'Invalid email or password',
      403: 'Access denied. Please check your account status',
      423: 'Account temporarily locked',
      500: 'Server error. Please try again later'
    };

    const statusCode = error.response?.status;
    const errorMessage = backendMessage || fallbackMessages[statusCode] || 'Login failed. Please try again.';

    throw new Error(errorMessage);
  }
};

  // Handle signup navigation with validation token
  const handleSignupClick = (e) => {
    e.preventDefault(); 
    
    // Mark user valid process follow
    sessionStorage.setItem('nav_from_login', 'true');
    sessionStorage.setItem('nav_timestamp', Date.now().toString());
    
    router.push('/registration');
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

          {/* Sign Up Link - ✅ MODIFIED */}
          <p className="text-center text-sm text-gray-600">
            New user?{' '}
            <Link 
              href="/registration" 
              onClick={handleSignupClick}
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