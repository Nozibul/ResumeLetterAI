'use client';

/**
 * @file page.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';
import { resumeTemplates } from '@/local-data/resume-templates';
import { ResumeSkeleton } from './ResumeSkeleton';
import Button from '@/shared/components/atoms/buttons/Button';
import { useSearchParams } from 'next/navigation';
import {
  INITIAL_ITEMS_ALL,
  INITIAL_ITEMS_FILTERED,
  ITEMS_PER_LOAD,
} from '@/lib/constants';
import Link from 'next/link';
import Typography from '@/shared/components/atoms/typography/Typography';

const TemplatePage = () => {
  const [moreItem, setMoreItem] = useState(INITIAL_ITEMS_ALL);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);

  // Hook to read the current URL's query parameters.
  const searchParams = useSearchParams();
  const category = searchParams.get('category');

  // Template Filtering Logic (Memoized for Performance)
  const displayedTemplates = useMemo(() => {
    if (!category) {
      return resumeTemplates;
    }
    return resumeTemplates.filter(
      (template) => template.category.toLowerCase() === category.toLowerCase()
    );
  }, [resumeTemplates, category]);

  // Side Effect Management for UI State
  useEffect(() => {
    setMoreItem(category ? INITIAL_ITEMS_FILTERED : INITIAL_ITEMS_ALL);
    setLoading(false);
  }, [category]);

  // "Load More" Functionality
  const loadMoreItem = () => {
    if (displayedTemplates?.length > moreItem) {
      setMoreItem((prev) => prev + ITEMS_PER_LOAD);
    }
  };

  const formatCategoryName = (name) => {
    if (!name) return '';
    return name.replace(/-resume$/i, '').replace(/^\w/, (c) => c.toUpperCase());
  };

  // Empty State Rendering
  if (!displayedTemplates || displayedTemplates.length === 0) {
    return (
      <div className="text-center py-10">
        <h4 className="text-xl text-gray-600">No templates found!</h4>
        <p className="text-gray-500 mt-2">Please check your data source.</p>
      </div>
    );
  }

  // Final Preparation for Rendering
  const templatesToShow = displayedTemplates.slice(0, moreItem);
  return (
    <>
      <div>
        {category && (
          <FilterHeader
            categoryItemLength={displayedTemplates.length}
            categoryName={formatCategoryName(category)}
          />
        )}
      </div>

      <div>
        {!loading ? (
          <div>
            {!category && (
              <div className="pt-8">
                <Typography variant="h3" className="text-center">
                  Pick a Resume Template That Fits Your Career
                </Typography>
              </div>
            )}
            <div className="p-10 grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-4 place-items-center">
              {templatesToShow.map((item) => (
                <div
                  key={item.id}
                  className="text-center py-4 relative w-64 h-90"
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="rounded-[10px] transition-all duration-300 ease-linear shadow-[0px_1px_8px_rgba(203,198,198,1)] relative w-full h-full hover:scale-[1.02]">
                    <Image
                      src={item.template}
                      alt={item.category || 'resume-template'}
                      fill
                      priority
                      className="object-cover rounded-lg"
                    />
                    {hovered === item.id && (
                      <p
                        onClick={() => handleButtonClick(item)}
                        className="cursor-pointer absolute inset-0 flex items-center justify-center text-white font-bold
                     opacity-0 hover:opacity-100 transition delay-50 duration-500 ease-in-out hover:-translate-y-1 hover:scale-[1.04]"
                      >
                        <Button variant="primary" size="sm">
                          Use Template
                        </Button>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ResumeSkeleton count={displayedTemplates?.length} />
        )}

        {/* Show More Button */}
        {displayedTemplates.length > moreItem && (
          <div className="text-center pb-8">
            <Button onClick={loadMoreItem} variant="primary" size="md">
              Show more templates ({displayedTemplates.length - moreItem}{' '}
              remaining)
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default TemplatePage;

// Sub-Component: FilterHeader
// This is the new component, defined below the main one for organization.

const FilterHeader = ({ categoryName, categoryItemLength }) => {
  return (
    <div className="md:flex md:justify-between md:items-center px-8 py-4">
      <div className="flex items-center justify-center md:justify-start md:mb-0">
        <span className="mt-2 text-gray-800">Showing Templates for: </span>
        <Typography variant="body">
          {categoryItemLength} Expertly Crafted{' '}
          <strong className="text-xl bg-gradient-to-r from-teal-600 to-purple-300 bg-clip-text text-transparent">
            {categoryName} Resume{' '}
          </strong>{' '}
          Templates
        </Typography>
      </div>

      <div className="text-center mt-2 md:text-right">
        <Link href="/#cardSection">
          <Button variant="outline" size="sm" className="cursor-pointer">
            ← Back to Categories
          </Button>
        </Link>
      </div>
    </div>
  );
};
