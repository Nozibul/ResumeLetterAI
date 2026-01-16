/**
 * @file features/templates/components/TemplateSelectionModal.jsx
 * @description Modal for choosing how to start resume building
 * @author Nozibul Islam
 */

'use client';

import React, { useState } from 'react';
import { X, Upload, Edit } from 'lucide-react';
import Button from '@/shared/components/atoms/buttons/Button';
import { useRouter } from 'next/navigation';

const TemplateSelectionModal = ({ isOpen, onClose, templateId }) => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(null);

  // Handle option selection
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  // Handle Next button click
  // Handle Next button click
  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedOption === 'scratch' && templateId) {
      // Just navigate - modal will unmount automatically
      router.push(`/resume-builder?templateId=${templateId}`);
    }
  };

  // Reset state on close
  const handleClose = () => {
    setSelectedOption(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto relative animate-modal-enter">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>

          {/* Modal Header */}
          <div className="text-center pt-10 pb-6 px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Are you uploading an existing resume?
            </h2>
            <p className="text-gray-600">
              Just review, edit, and update it with new information
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid md:grid-cols-2 gap-6 px-10 pb-8">
            {/* Option 1: Upload Resume (Disabled) */}
            <OptionCard
              icon={<Upload size={40} className="text-teal-600" />}
              title="Yes, upload from my resume"
              description="We'll give you expert guidance to fill out your info and enhance your resume, from start to finish"
              isSelected={selectedOption === 'upload'}
              isDisabled={true}
              onClick={() => handleOptionSelect('upload')}
              badge="Coming Soon"
            />

            {/* Option 2: Start from Scratch */}
            <OptionCard
              icon={<Edit size={40} className="text-teal-600" />}
              title="No, start from scratch"
              description="We'll guide you through the whole process so your skills can shine"
              isSelected={selectedOption === 'scratch'}
              isDisabled={false}
              onClick={() => handleOptionSelect('scratch')}
            />
          </div>

          {/* Next Button */}
          <div className="flex justify-end px-10 pb-8">
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={!selectedOption || selectedOption === 'upload'}
              className="min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              NEXT
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateSelectionModal;

// ==========================================
// SUB-COMPONENT: OptionCard
// ==========================================

const OptionCard = ({
  icon,
  title,
  description,
  isSelected,
  isDisabled,
  onClick,
  badge,
}) => {
  return (
    <div
      onClick={isDisabled ? null : onClick}
      className={`
        relative p-8 rounded-xl border-2 transition-all duration-300 cursor-pointer
        ${isDisabled ? 'cursor-not-allowed opacity-60' : 'hover:shadow-lg'}
        ${
          isSelected && !isDisabled
            ? 'border-teal-600 bg-teal-50 shadow-lg'
            : 'border-gray-200 hover:border-teal-400'
        }
      `}
      role="radio"
      aria-checked={isSelected}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
    >
      {/* Badge for disabled option */}
      {badge && isDisabled && (
        <span className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
          {badge}
        </span>
      )}

      {/* Icon */}
      <div className="flex justify-center mb-4">{icon}</div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 text-center mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 text-center leading-relaxed">
        {description}
      </p>

      {/* Selection Indicator */}
      {isSelected && !isDisabled && (
        <div className="absolute top-4 left-4">
          <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
