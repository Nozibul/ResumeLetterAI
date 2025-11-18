'use client';
/**
 * @file RegistrationForm.jsx
 * @author Nozibul Islams
 */

import React, { useState } from 'react';
import { Mail, User, Lock } from 'lucide-react';
import InputField from '@/shared/components/molecules/inputField/InputField';
import PasswordField from '@/shared/components/molecules/passwordField/PasswordField';
import Checkbox from '@/shared/components/atoms/checkbox/Checkbox';
import Button from '@/shared/components/atoms/buttons/Button';
import GoogleAuthButton from '@/shared/components/molecules/googleAuthButton/GoogleAuthButton.jsx';
import AuthDivider from '@/shared/components/molecules/authDivider/AuthDivider';

const RegistrationForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isLoading) return; // Prevent multiple 
    setIsLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
    <form onSubmit={handleSubmit}>
      {/* Google Auth  */}
      <GoogleAuthButton text="Sign up with Google" />
      <AuthDivider />

      <InputField
        label="Full Name"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Enter your full name"
        icon={User}
        error={errors.fullName}
      />

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

      <PasswordField
        label="Password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Create a strong password"
        icon={Lock}
        showStrength={true}
        error={errors.password}
      />

      <PasswordField
        label="Confirm Password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm your password"
        icon={Lock}
        showMatch={true}
        matchValue={formData.password}
        error={errors.confirmPassword}
      />

      <Checkbox
        name="agreedToTerms"
        checked={formData.agreedToTerms}
        onChange={handleChange}
        label={
          <>
            I agree to the{' '}
            <span className=" text-blue-600 hover:text-blue-700 hover:underline">
                Terms
            </span>{' '}
            and{' '}
            <span className=" text-blue-600 hover:text-blue-700 hover:underline">
                Privacy Policy
            </span>
          </>
        }
        error={errors.agreedToTerms}
      />

      <Button 
        className="w-full mt-2"
        type="submit"
        variant="primary"
        size = 'md'
        loading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'Creating your account...' : 'Create Account'}
      </Button>
      </form>
    </div>
  );
};

export default RegistrationForm;