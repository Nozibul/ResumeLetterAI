'use client';

import Icon from '@/shared/components/atoms/icons/Icon';
import Typography from '@/shared/components/atoms/typography/Typography';
import ResumeCategoryCard from '@/shared/components/molecules/resumeCategoryCard/ResumeCategoryCard';
import { useState } from 'react';

/**
 * @file CategoryCard.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

const CategoryCard = () => {
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  // JSON Data - Easy to modify/extend
  const templatesData = [
    {
      id: 'ats-friendly',
      color: 'blue',
      category: 'ATS Friendly',
      features: ['ATS Friendly', 'Clean Design', 'Professional'],
    },
    {
      id: 'corporate',
      color: 'purple',
      category: 'Corporate Resume',
      features: ['Colorful', 'Unique Layout', 'Eye-catching'],
    },
    {
      id: 'executive',
      color: 'amber',
      category: 'Executive Resume',
      features: ['Statement', 'Dynamic', 'Attention-grabbing'],
    },
    {
      id: 'creative',
      color: 'green',
      category: 'Creative Resume',
      features: ['Formal', 'Traditional', 'Corporate'],
    },
    {
      id: 'it',
      color: 'orange',
      category: 'IT Resume',
      features: ['Simple', 'Elegant', 'Focused'],
    },
  ];

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <Typography variant="h2" className="mb-4">
          Choose Your Perfect Resume Template Category
        </Typography>
        <Typography variant="body">
          Select from our professionally designed templates to create a resume
          that stands out
        </Typography>
      </div>

      {/* Template Grid - Uses JSON data */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-8">
          {templatesData.map((template, index) => (
            <div
              key={template.id}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <ResumeCategoryCard
                template={template}
                isActive={hoveredTemplate === template.id}
                isHovered={hoveredTemplate === template.id}
                onClick={() => setActiveTemplate(template.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Selected Template Info */}
      <div className="mt-4 text-center">
        <div
          className={`bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 max-w-md mx-auto transition-all duration-400 ease-out transform ${
            hoveredTemplate
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-6 scale-95'
          }`}
        >
          <Typography
            variant="body"
            className={`mb-2 transition-all duration-100 ease-out ${
              hoveredTemplate
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-3'
            }`}
          >
            {templatesData.find((t) => t.id === hoveredTemplate)?.category}
          </Typography>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {templatesData
              .find((t) => t.id === hoveredTemplate)
              ?.features?.map((feature, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full transition-all duration-500 ease-out transform ${
                    hoveredTemplate
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-4 scale-85'
                  }`}
                >
                  {feature}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
