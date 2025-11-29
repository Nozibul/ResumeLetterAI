"use client";
/**
 * @file ForgotPasswordForm.jsx
 * @description Forgot Password Form Component
 * @author Nozibul Islam
 */

import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import Button from '@/shared/components/atoms/buttons/Button';
import InputField from '@/shared/components/molecules/inputField/InputField';

const ForgotPasswordForm = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    
    // Clear error when user starts typing
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
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
      await onSubmit(email);
    } catch (error) {
      // Handle specific errors
      const errorMessage = error.message || 'Failed to send reset link. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* General Error */}
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {errors.general}
        </div>
      )}

      {/* Email Field */}
      <InputField
        label="Email Address"
        type="email"
        name="email"
        value={email}
        onChange={handleChange}
        placeholder="your.email@example.com"
        icon={Mail}
        error={errors.email}
        disabled={isLoading}
      />

      {/* Submit Button */}
      <Button
        className="w-full"
        type="submit"
        variant="primary"
        disabled={isLoading}
        loading={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;