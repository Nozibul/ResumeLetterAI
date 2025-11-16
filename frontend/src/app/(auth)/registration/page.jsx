'use client';
/**
 * @file page.jsx
 * @author Nozibul Islam
 * @AIPromptUsed "My AI prompt here"
 */
import { User } from 'lucide-react';
import Link from 'next/link';
import RegistrationForm from '@/features/auth/ui/RegistrationForm';

export default function RegistrationPage() {
  const handleRegistration = async (formData) => {
    // API call
    console.log('Registration data:', formData);
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
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl mb-2">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500">Join us and start building amazing resumes</p>
          </div>

          <RegistrationForm onSubmit={handleRegistration} />

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