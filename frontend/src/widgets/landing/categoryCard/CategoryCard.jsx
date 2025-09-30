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
import { formatCategoryName } from '@/shared/lib/formatCategoryName';
import { resumeCards } from '@/local-data/cardCategory';

const CategoryCard = () => {
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  // Category name
  const categoryName = formatCategoryName(
    resumeCards.find((t) => t.id === hoveredTemplate)?.category
  );

  return (
    <>
      <div id="cardSection" className=" w-full p-4 mt-2">
        {/* Header */}
        <div className="text-center mb-12">
          <Typography variant="h2" className="mb-4">
            Choose Your Preferred Template Category
          </Typography>
          <Typography variant="body" className="text-gray-500">
            Select from our professionally designed templates to create a resume
            that stands out
          </Typography>
        </div>

        {/* Template Grid - Uses JSON data */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6">
            {resumeCards?.map((resumeCard, index) => (
              <Link
                key={resumeCard.id}
                href={{
                  pathname: '/resume-templates',
                  query: { category: resumeCard.category },
                }}
              >
                <div
                  onMouseEnter={() => setHoveredTemplate(resumeCard.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                >
                  <ResumeCategoryCard
                    templates={resumeCard}
                    isActive={hoveredTemplate === resumeCard.id}
                    isHovered={hoveredTemplate === resumeCard.id}
                    index={index}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Selected Template Info */}
        <div className="flex items-center justify-center h-[110px] w-full mt-2">
          <div className="w-[700px] flex items-center justify-center">
            <div
              className={`rounded-xl p-6 w-full transition-all duration-400 ease-out transform ${
                hoveredTemplate
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-6 scale-95'
              }`}
            >
              <Typography
                variant="body"
                className={`mb-2 text-center transition-all duration-100 ease-out ${
                  hoveredTemplate
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-3'
                }`}
              >
                {categoryName}
              </Typography>
              <div className="flex flex-wrap items-center justify-center gap-2 min-w-[500px] max-w-[600px] mx-auto">
                {resumeCards
                  .find((t) => t.id === hoveredTemplate)
                  ?.features?.map((feature, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 bg-teal-400 text-white text-xs rounded-full whitespace-nowrap transition-all duration-500 ease-out transform ${
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
      </div>
    </>
  );
};

export default CategoryCard;
