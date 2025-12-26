'use client';

/**
 * @file CategoryCard.jsx
 * @description Category selection cards with Redux integration
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Typography from '@/shared/components/atoms/typography/Typography';
import ResumeCategoryCard from '@/shared/components/molecules/resumeCategoryCard/ResumeCategoryCard';
// import { formatCategoryName } from '@/shared/lib/formatCategoryName';
import { useAppDispatch } from '@/shared/store/hooks/useTemplates';
import { useCategoryStats, useTemplateLoading } from '@/shared/store/hooks/useTemplates';
import { fetchCategoryStats } from '@/shared/store/actions/templateActions';

// Category metadata (static info)
const CATEGORY_METADATA = {
  'ats-friendly': {
    id: 1,
    category: 'ats-friendly',
    displayName: 'ATS-Friendly Resume',
    description: 'Optimized for Applicant Tracking Systems',
    features: ['ATS Optimized', 'Clean Layout', 'Keyword Rich', 'Professional'],
    color: 'from-blue-500 to-blue-600',
    icon: '📋',
  },
  'corporate': {
    id: 2,
    category: 'corporate',
    displayName: 'Corporate Resume',
    description: 'Perfect for corporate and business roles',
    features: ['Professional', 'Business-Focused', 'Executive Style', 'Elegant'],
    color: 'from-red-500 to-red-600',
    icon: '💼',
  },
  'executive': {
    id: 3,
    category: 'executive',
    displayName: 'Executive Resume',
    description: 'For senior leadership positions',
    features: ['Leadership Focused', 'Executive Style', 'Strategic', 'Premium'],
    color: 'from-green-500 to-green-600',
    icon: '👔',
  },
  'creative': {
    id: 4,
    category: 'creative',
    displayName: 'Creative Resume',
    description: 'Stand out with creative designs',
    features: ['Creative Design', 'Eye-Catching', 'Modern', 'Unique'],
    color: 'from-orange-500 to-orange-600',
    icon: '🎨',
  },
  'it': {
    id: 5,
    category: 'it',
    displayName: 'IT Resume',
    description: 'Tailored for tech professionals',
    features: ['Tech-Focused', 'Skills Highlight', 'Project Showcase', 'GitHub Ready'],
    color: 'from-purple-500 to-purple-600',
    icon: '💻',
  },
};

const CategoryCard = () => {
  const dispatch = useAppDispatch();
  const categoryStats = useCategoryStats();
  const loading = useTemplateLoading();
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  // Fetch category stats on mount
  useEffect(() => {
    dispatch(fetchCategoryStats());
  }, [dispatch]);

  // Merge metadata with stats
  const categories = Object.entries(CATEGORY_METADATA).map(([key, metadata]) => ({
    ...metadata,
    count: categoryStats[key] || 0,
  }));

  // Get hovered category details
  const hoveredCategory = categories.find((cat) => cat.id === hoveredTemplate);

  return (
    <div id="cardSection" className="w-full p-4 mt-2">
      {/* Header */}
      <div className="text-center mb-12">
        <Typography variant="h2" className="mb-4">
          Choose Your Preferred Template Category
        </Typography>
        <Typography variant="body" className="text-gray-500">
          Select from our professionally designed templates to create a resume that stands out
        </Typography>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-64 h-80 bg-gray-200 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Category Grid */}
      {!loading && (
        <>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-6">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={{
                    pathname: '/resume-templates',
                    query: { category: category.category },
                  }}
                >
                  <div
                    onMouseEnter={() => setHoveredTemplate(category.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                  >
                    <ResumeCategoryCard
                      templates={{
                        ...category,
                        // Add template count to display
                        templateCount: category.count,
                      }}
                      isActive={hoveredTemplate === category.id}
                      isHovered={hoveredTemplate === category.id}
                      index={index}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Selected Category Info (Hover Effect) */}
          <div className="flex items-center justify-center h-[110px] w-full mt-2">
            <div className="w-[700px] flex items-center justify-center">
              <div
                className={`rounded-xl p-6 w-full transition-all duration-400 ease-out transform ${
                  hoveredTemplate
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-6 scale-95'
                }`}
              >
                {hoveredCategory && (
                  <>
                    <Typography
                      variant="body"
                      className="mb-2 text-center transition-all duration-100 ease-out"
                    >
                      {hoveredCategory.displayName}
                      <span className="ml-2 text-teal-600 font-semibold">
                        ({hoveredCategory.count} templates)
                      </span>
                    </Typography>
                    <div className="flex flex-wrap items-center justify-center gap-2 min-w-[500px] max-w-[600px] mx-auto">
                      {hoveredCategory.features?.map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-teal-400 text-white text-xs rounded-full whitespace-nowrap transition-all duration-500 ease-out transform opacity-100 translate-y-0 scale-100"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryCard;