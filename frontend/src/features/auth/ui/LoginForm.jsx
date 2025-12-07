"use client";
/**
 * @file LoginForm.jsx
 * @author Nozibul Islams
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import Button from '@/shared/components/atoms/buttons/Button';
import Checkbox from '@/shared/components/atoms/checkbox/Checkbox';
import PasswordField from '@/shared/components/molecules/passwordField/PasswordField';
import InputField from '@/shared/components/molecules/inputField/InputField';
import GoogleAuthButton from '@/shared/components/molecules/googleAuthButton/GoogleAuthButton.jsx';
import AuthDivider from '@/shared/components/molecules/authDivider/AuthDivider';
import toast from 'react-hot-toast';


const LoginForm = ({ onSubmit, isLocked, timeRemaining, formatTime }) => { 
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: inputValue }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await onSubmit(formData);
    } catch (error) {
      const errorMessage = error.message || 'Invalid email or password';
      
      // Use toast instead of setErrors for lock message
      if (errorMessage.includes('locked')) {
        toast.error(errorMessage, {
          duration: 5000, // 5 seconds
          position: 'top-center',
        });
      } else {
        // Normal errors - show in form
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      {/* General Error */}
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {errors.general}
        </div>
      )}

      {/* Google Auth Button */}
      <GoogleAuthButton text="Sign up with Google" />
      <AuthDivider text='Or with email and password' />

      {/* Email Field */}
      <InputField
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        icon={Mail}
        error={errors.email}
      />

      {/* Password Field */}
      <PasswordField
        label="Password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
        icon={Lock}
        error={errors.password}
      />

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <Checkbox
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleChange}
          label="Remember me"
        />
        
        <Link 
          href="/forgot-password" 
          className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Lock Timer - Show below button */}
      {isLocked && timeRemaining > 0 && (
        <div className="mt-6 p-3 bg-amber-50 border border-teal-300 rounded-lg">
          <div className="flex items-center gap-2 text-amber-700">
            <Lock className="w-4 h-4" />
            <span className="font-semibold text-sm">
              Account Locked - Try again in {formatTime(timeRemaining)} ({Math.ceil(timeRemaining / 60000)} minutes)
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        className="w-full mt-2"
        type="submit"
        onClick={handleSubmit}
        variant="primary"
        disabled={isLoading || isLocked}  //  isLocked from props
        loading={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </div>
  );
};

export default LoginForm;