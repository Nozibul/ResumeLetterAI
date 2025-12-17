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
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/shared/components/atoms/buttons/Button';
import Typography from '@/shared/components/atoms/typography/Typography';
import TemplateGrid from '@/features/templates/ui/TemplateGrid';
import { CardSkeleton } from '@/shared/components/atoms/cardSkeleton/CardSkeleton';
import { useAllTemplates, useTemplateLoading, useTemplateError, useAppDispatch } from '@/shared/store/hooks/useTemplates';
import { fetchAllTemplates } from '@/shared/store/actions/templateActions';
import { formatCategoryName } from '@/shared/lib/formatCategoryName';
import {
  INITIAL_ITEMS_ALL,
  INITIAL_ITEMS_FILTERED,
  ITEMS_PER_LOAD,
} from '@/shared/lib/constants';

const TemplatePage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
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

  // Handle "Use Template" click
  const handleUseTemplate = (templateId) => {
    router.push(`/resume-builder?templateId=${templateId}`);
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
          {category ? `No templates available for "${formatCategoryName(category)}" category.` : 'Please check back later.'}
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
          <TemplateGrid
            templates={templatesToShow}
            onUseTemplate={handleUseTemplate}
          />

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




// 'use client';
// /**
//  * @file page.jsx
//  * @author Nozibul Islam
//  *
//  * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
//  * @license MIT
//  */

// import Image from 'next/image';
// import React, { useState, useEffect, useMemo } from 'react';
// import Button from '@/shared/components/atoms/buttons/Button';
// import { useSearchParams } from 'next/navigation';
// import {
//   INITIAL_ITEMS_ALL,
//   INITIAL_ITEMS_FILTERED,
//   ITEMS_PER_LOAD,
// } from '@/shared/lib/constants';
// import Link from 'next/link';
// import Typography from '@/shared/components/atoms/typography/Typography';
// import { formatCategoryName } from '@/shared/lib/formatCategoryName';
// import { resumeTemplates } from '@/local-data/template-data';
// import { CardSkeleton } from '@/shared/components/atoms/cardSkeleton/CardSkeleton';

// const TemplatePage = () => {
//   const [moreItem, setMoreItem] = useState(INITIAL_ITEMS_ALL);
//   const [loading, setLoading] = useState(true);
//   const [hovered, setHovered] = useState(null);

//   // Hook to read the current URL's query parameters.
//   const searchParams = useSearchParams();
//   const category = searchParams.get('category');

//   // Template Filtering Logic (Memoized for Performance)
//   const displayedTemplates = useMemo(() => {
//     if (!category) {
//       return resumeTemplates;
//     }
//     return resumeTemplates.filter(
//       (template) => template.category.toLowerCase() === category.toLowerCase()
//     );
//   }, [resumeTemplates, category]);

//   // Side Effect Management for UI State
//   useEffect(() => {
//     setMoreItem(category ? INITIAL_ITEMS_FILTERED : INITIAL_ITEMS_ALL);
//     setLoading(false);
//   }, [category]);

//   // "Load More" Functionality
//   const loadMoreItem = () => {
//     if (displayedTemplates?.length > moreItem) {
//       setMoreItem((prev) => prev + ITEMS_PER_LOAD);
//     }
//   };

//   // Empty State Rendering
//   if (!displayedTemplates || displayedTemplates.length === 0) {
//     return (
//       <div className="text-center py-10">
//         <h4 className="text-xl text-gray-600">No templates found!</h4>
//         <p className="text-gray-500 mt-2">Please check your data source.</p>
//       </div>
//     );
//   }

//   // Final Preparation for Rendering
//   const templatesToShow = displayedTemplates.slice(0, moreItem);

//   return (
//     <>
//       <div>
//         {category && (
//           <FilterHeader
//             categoryItemLength={displayedTemplates.length}
//             categoryName={formatCategoryName(category)}
//           />
//         )}
//       </div>

//       <div>
//         {!loading ? (
//           <div>
//             {!category && (
//               <div className="pt-8">
//                 <Typography variant="h3" className="text-center">
//                   Pick a Resume Template That Fits Your Career
//                 </Typography>
//               </div>
//             )}
//             <div className="p-10 grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-4 place-items-center">
//               {templatesToShow.map((item) => (
//                 <div
//                   key={item.id}
//                   className="text-center py-4 relative w-64 h-90"
//                   onMouseEnter={() => setHovered(item.id)}
//                   onMouseLeave={() => setHovered(null)}
//                 >
//                   <div className="rounded-[10px] transition-all duration-300 ease-linear shadow-[0px_1px_8px_rgba(203,198,198,1)] relative w-full h-full hover:scale-[1.02]">
//                     <Image
//                       src={item.template}
//                       alt={item.category || 'resume-template'}
//                       fill
//                       priority
//                       className="object-cover rounded-lg"
//                     />
//                     {hovered === item.id && (
//                       <p
//                         onClick={() => handleButtonClick(item)}
//                         className="cursor-pointer absolute inset-0 flex items-center justify-center text-white font-bold
//                      opacity-0 hover:opacity-100 transition delay-50 duration-500 ease-in-out hover:-translate-y-1 hover:scale-[1.04]"
//                       >
//                         <Button variant="primary" size="sm">
//                           Use Template
//                         </Button>
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <CardSkeleton count={displayedTemplates?.length} />
//         )}

//         {/* Show More Button */}
//         {displayedTemplates.length > moreItem && (
//           <div className="text-center pb-8">
//             <Button onClick={loadMoreItem} variant="primary" size="md">
//               Show more templates ({displayedTemplates.length - moreItem}{' '}
//               remaining)
//             </Button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default TemplatePage;

// // Sub-Component: FilterHeader
// // This is the new component, defined below the main one for organization.

// const FilterHeader = ({ categoryName, categoryItemLength }) => {
//   return (
//     <div className="md:flex md:justify-between md:items-center px-8 py-4">
//       <div className="flex items-center justify-center md:justify-start md:mb-0">
//         <span className="mt-2 text-gray-800">Showing Templates for: </span>
//         <Typography variant="body">
//           {categoryItemLength} Expertly Crafted{' '}
//           <strong className="text-xl bg-gradient-to-r from-teal-600 to-purple-300 bg-clip-text text-transparent">
//             {categoryName}
//           </strong>{' '}
//           Resume Templates
//         </Typography>
//       </div>

//       <div className="text-center mt-2 md:text-right">
//         <Link href="/#cardSection">
//           <Button variant="outline" size="sm" className="cursor-pointer">
//             ← Back to Categories
//           </Button>
//         </Link>
//       </div>
//     </div>
//   );
// };
