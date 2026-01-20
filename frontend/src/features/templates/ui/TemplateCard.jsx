/**
 * @file features/templates/components/TemplateCard.jsx
 * @description Individual template card component with modal integration
 * @author Nozibul Islam
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Button from '@/shared/components/atoms/buttons/Button';
import { Star, Crown } from 'lucide-react';
import TemplateSelectionModal from './TemplateSelectionModal';

const TemplateCard = ({ template }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUseTemplate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Opening modal for template:', template._id); // Debug log
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('Closing modal'); // Debug log
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className="relative w-[295px] h-[460px] group cursor-pointer mb-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Card Container */}
        <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
          {/* Template Image */}
          <Image
            src={template.thumbnailUrl}
            alt={template.category || 'Resume Template'}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Premium Badge */}
          {template.isPremium && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Crown size={12} />
              Premium
            </div>
          )}

          {/* Rating Badge */}
          {template.rating > 0 && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star size={12} className="fill-yellow-500 text-yellow-500" />
              {template.rating.toFixed(1)}
            </div>
          )}

          {/* Hover Overlay */}
          {isHovered && (
            <div className="absolute inset-0 backdrop-blur-xs flex items-center justify-center transition-all duration-300">
              <Button
                variant="primary"
                size="sm"
                onClick={handleUseTemplate}
                className="transform hover:scale-105 transition-transform"
              >
                Use Template
              </Button>
            </div>
          )}
        </div>

        {/* Template Info (Below Card) */}
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600 capitalize">
            {template.category.replace(/-/g, ' ')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Used by {template.usageCount.toLocaleString()}+ people
          </p>
        </div>
      </div>

      {/* Selection Modal */}
      <TemplateSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        templateId={template._id}
      />
    </>
  );
};

export default TemplateCard;
