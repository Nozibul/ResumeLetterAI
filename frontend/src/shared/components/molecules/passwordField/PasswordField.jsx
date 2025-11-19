"use client";
import React, { useState } from 'react';

import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import Input from '../../atoms/input/Input';

const PasswordField = ({ 
  label, 
  name,
  value,
  onChange,
  error,
  showStrength = false,
  showMatch = false,
  matchValue = '',
  ...inputProps 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);

  const calculateStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  };

  const handleChange = (e) => {
    onChange(e);
    if (showStrength) {
      setStrength(calculateStrength(e.target.value));
    }
  };

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="space-y-1 mt-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={handleChange}
          error={error}
          className="pr-12"
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {showStrength && value && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < strength ? getStrengthColor() : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className={`text-xs font-medium ${
            strength <= 2 ? 'text-red-500' : 
            strength <= 3 ? 'text-yellow-500' : 'text-green-500'
          }`}>
            {getStrengthText()}
          </p>
        </div>
      )}

      {showMatch && value && matchValue && value === matchValue && (
        <p className="text-green-500 text-sm flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          Passwords match
        </p>
      )}

      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <AlertCircle className="w-3 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordField;