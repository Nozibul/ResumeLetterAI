"use client";

import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import Button from '@/shared/components/atoms/buttons/Button';
import Checkbox from '@/shared/components/atoms/checkbox/Checkbox';
import PasswordField from '@/shared/components/molecules/passwordField/PasswordField';
import InputField from '@/shared/components/molecules/inputField/InputField';
import GoogleAuthButton from '@/shared/components/molecules/googleAuthButton/GoogleAuthButton.jsx';
import AuthDivider from '@/shared/components/molecules/authDivider/AuthDivider';


const LoginForm = ({ onSubmit }) => {
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

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Login failed:', error);
      setErrors({ general: 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* General Error */}
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {errors.general}
        </div>
      )}

      {/* Google Auth Button */}
      <GoogleAuthButton text="Sign up with Google" />
      <AuthDivider />

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
        
        <a 
          href="#" 
          className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
        >
          Forgot password?
        </a>
      </div>

      {/* Submit Button */}
      <Button
      className="w-full mt-2"
        type="submit"
        onClick={handleSubmit}
        variant="primary"
        loading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </div>
  );
};

export default LoginForm;