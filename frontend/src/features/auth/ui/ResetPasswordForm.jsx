"use client";
/**
 * @file ResetPasswordForm.jsx
 * @description Reset Password Form Component with validation
 * @author Nozibul Islam
 */

import React, { useState } from 'react';
import { Lock, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/shared/components/atoms/buttons/Button';
import PasswordField from '@/shared/components/molecules/passwordField/PasswordField';

const ResetPasswordForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: 'Too weak', color: 'bg-red-500' },
      { strength: 1, label: 'Weak', color: 'bg-red-400' },
      { strength: 2, label: 'Fair', color: 'bg-yellow-500' },
      { strength: 3, label: 'Good', color: 'bg-blue-500' },
      { strength: 4, label: 'Strong', color: 'bg-green-500' },
      { strength: 5, label: 'Very Strong', color: 'bg-green-600' },
    ];

    return levels[strength];
  };

  const passwordStrength = checkPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Trim spaces before comparison
    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const errorMessage = error.message || 'Failed to reset password. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* General Error */}
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* New Password Field */}
      <div>
        <PasswordField
          label="New Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your new password"
          icon={Lock}
          error={errors.password}
          disabled={isLoading}
        />

        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${passwordStrength.color} transition-all duration-300`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-600">
                {passwordStrength.label}
              </span>
            </div>

            {/* Password Requirements */}
            <div className="space-y-1 text-xs">
              <PasswordRequirement
                met={formData.password.length >= 8}
                text="At least 8 characters"
              />
              <PasswordRequirement
                met={/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)}
                text="Contains uppercase and lowercase"
              />
              <PasswordRequirement
                met={/\d/.test(formData.password)}
                text="Contains a number"
              />
              <PasswordRequirement
                met={/[^a-zA-Z0-9]/.test(formData.password)}
                text="Contains a special character"
              />
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <PasswordField
        label="Confirm Password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm your new password"
        icon={Lock}
        error={errors.confirmPassword}
        disabled={isLoading}
      />

      {/* Submit Button */}
      <Button
        className="w-full mt-6"
        type="submit"
        variant="primary"
        disabled={isLoading || passwordStrength.strength < 2}
        loading={isLoading}
      >
        {isLoading ? 'Resetting Password...' : 'Reset Password'}
      </Button>

      {/* Security Note */}
      <p className="text-xs text-gray-500 text-center mt-4">
        🔒 Your password will be securely encrypted
      </p>
    </form>
  );
};

// Helper Component for Password Requirements
const PasswordRequirement = ({ met, text }) => (
  <div className="flex items-center gap-2">
    {met ? (
      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
    ) : (
      <XCircle className="w-3.5 h-3.5 text-gray-400" />
    )}
    <span className={met ? 'text-green-600' : 'text-gray-500'}>{text}</span>
  </div>
);

export default ResetPasswordForm;