'use client';
/**
 * @file app/templates/page.jsx
 * @description Template list page with Redux integration
 * @author Nozibul Islam
 *
 * Features:
 * - Fetches templates from backend via Redux
 * - Category filtering via URL params
 * - Pagination (load more)
 * - Optimistic UI with skeleton loading
 * - Responsive grid layout
 *
 * ⚠️ NO CHANGES NEEDED - Keep this file exactly as is
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/shared/components/atoms/buttons/Button';
import Typography from '@/shared/components/atoms/typography/Typography';
import TemplateGrid from '@/features/templates/ui/TemplateGrid';
import { CardSkeleton } from '@/shared/components/atoms/cardSkeleton/CardSkeleton';
import {
  useAllTemplates,
  useTemplateLoading,
  useTemplateError,
  useAppDispatch,
} from '@/shared/store/hooks/useTemplates';
import { fetchAllTemplates } from '@/shared/store/actions/templateActions';
import { formatCategoryName } from '@/shared/lib/formatCategoryName';
import {
  INITIAL_ITEMS_ALL,
  INITIAL_ITEMS_FILTERED,
  ITEMS_PER_LOAD,
} from '@/shared/lib/constants';

const TemplatePage = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  // Redux state
  const templates = useAllTemplates();
  const loading = useTemplateLoading();
  const error = useTemplateError();

  // Local state for pagination
  const [itemsToShow, setItemsToShow] = useState(INITIAL_ITEMS_ALL);

  // Get category from URL
  const category = searchParams.get('category');

  // Fetch templates on mount or category change
  useEffect(() => {
    dispatch(fetchAllTemplates(category));

    // Reset pagination based on filter
    setItemsToShow(category ? INITIAL_ITEMS_FILTERED : INITIAL_ITEMS_ALL);
  }, [dispatch, category]);

  // Load more functionality
  const loadMoreItems = () => {
    if (templates.length > itemsToShow) {
      setItemsToShow((prev) => prev + ITEMS_PER_LOAD);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="text-center py-20">
        <Typography variant="h4" className="text-red-600 mb-4">
          {error}
        </Typography>
        <Button
          onClick={() => dispatch(fetchAllTemplates(category))}
          variant="primary"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Empty state
  if (!loading && templates.length === 0) {
    return (
      <div className="text-center py-20">
        <Typography variant="h4" className="text-gray-600 mb-2">
          No templates found!
        </Typography>
        <Typography variant="body" className="text-gray-500 mb-6">
          {category
            ? `No templates available for "${formatCategoryName(category)}" category.`
            : 'Please check back later.'}
        </Typography>
        {category && (
          <Link href="/templates">
            <Button variant="primary">View All Templates</Button>
          </Link>
        )}
      </div>
    );
  }

  // Templates to display (with pagination)
  const templatesToShow = templates.slice(0, itemsToShow);
  const remainingCount = templates.length - itemsToShow;

  return (
    <div className="min-h-screen">
      {/* Filter Header */}
      {category && (
        <FilterHeader
          categoryName={formatCategoryName(category)}
          categoryItemLength={templates.length}
        />
      )}

      {/* Page Title (when no filter) */}
      {!category && !loading && (
        <div className="pt-8 pb-4">
          <Typography variant="h3" className="text-center">
            Pick a Resume Template That Fits Your Career
          </Typography>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="p-10">
          <CardSkeleton count={8} />
        </div>
      ) : (
        <>
          {/* Template Grid */}
          <TemplateGrid templates={templatesToShow} />

          {/* Load More Button */}
          {remainingCount > 0 && (
            <div className="text-center pb-8">
              <Button onClick={loadMoreItems} variant="primary" size="md">
                Show more templates ({remainingCount} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TemplatePage;

// ==========================================
// SUB-COMPONENT: FilterHeader
// ==========================================

const FilterHeader = ({ categoryName, categoryItemLength }) => {
  return (
    <div className="md:flex md:justify-between md:items-center px-8 py-4 border-b">
      <div className="flex items-center justify-center md:justify-start mb-4 md:mb-0">
        <Typography variant="body" className="text-gray-600 mr-2">
          Showing Templates for:
        </Typography>
        <Typography variant="h6">
          {categoryItemLength} Expertly Crafted{' '}
          <span className="bg-gradient-to-r from-teal-600 to-purple-300 bg-clip-text text-transparent">
            {categoryName}
          </span>{' '}
          Resume Templates
        </Typography>
      </div>

      <div className="text-center md:text-right">
        <Link href="/#cardSection">
          <Button variant="outline" size="sm">
            ← Back to Categories
          </Button>
        </Link>
      </div>
    </div>
  );
};
