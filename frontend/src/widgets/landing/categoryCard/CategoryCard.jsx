'use client';

/**
 * @file CategoryCard.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import Typography from '@/shared/components/atoms/typography/Typography';
import ResumeCategoryCard from '@/shared/components/molecules/resumeCategoryCard/ResumeCategoryCard';
import Link from 'next/link';
import { useState } from 'react';
import { resumeTemplate } from '@/local-data/template-data';

const CategoryCard = () => {
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  // First 5 templates
  const first5Templates = resumeTemplate.slice(0, 5);

  return (
    <>
      <div id="cardSection" className="w-full p-4 mt-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Typography variant="h2" className="mb-4">
            Choose Your Preferred Template Category
          </Typography>
          <Typography variant="body">
            Select from our professionally designed templates to create a resume
            that stands out
          </Typography>
        </div>

        {/* Template Grid - Uses JSON data */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8">
            {first5Templates?.map(({ id, color, category }) => (
              <Link
                key={id}
                href={{
                  pathname: '/resume-templates',
                  query: { category },
                }}
              >
                <div
                  onMouseEnter={() => setHoveredTemplate(id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                >
                  <ResumeCategoryCard
                    color={color}
                    category={category}
                    isActive={hoveredTemplate === id}
                    isHovered={hoveredTemplate === id}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Selected Template Info */}
        <div className="h-[110px] mt-2 text-center">
          <div
            className={` rounded-xl p-6 max-w-md mx-auto transition-all duration-400 ease-out transform ${
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
              {first5Templates.find((t) => t.id === hoveredTemplate)?.category}
            </Typography>
            <div className="flex flex-wrap justify-center gap-2">
              {first5Templates
                .find((t) => t.id === hoveredTemplate)
                ?.features?.map((feature, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 bg-teal-300 text-white text-xs rounded-full transition-all duration-500 ease-out transform ${
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
    </>
  );
};

export default CategoryCard;
