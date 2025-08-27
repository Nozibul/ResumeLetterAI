'use client';

/**
 * @file page.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { resumeTemplates } from '@/local-data/resume-templates';
import { ResumeSkeleton } from './ResumeSkeleton';
import Button from '@/shared/components/atoms/buttons/Button';

const TemplatePage = () => {
  const [moreItem, setMoreItem] = useState(8);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    // Simulate loading or check if data exists
    if (resumeTemplates && resumeTemplates.length > 0) setLoading(false);
  }, []);

  // Load more items
  const loadMoreItem = () => {
    if (resumeTemplates?.length > moreItem) {
      setMoreItem((prev) => prev + 4);
    }
  };

  if (!resumeTemplates || resumeTemplates.length === 0) {
    return (
      <div className="text-center py-10">
        <h4 className="text-xl text-gray-600">No templates found!</h4>
        <p className="text-gray-500 mt-2">Please check your data source.</p>
      </div>
    );
  }

  return (
    <div>
      {!loading ? (
        <div className="p-10 grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-3 place-items-center">
          {resumeTemplates.slice(0, moreItem).map((item) => (
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
      ) : (
        <ResumeSkeleton count={moreItem} />
      )}

      {/* Show More Button */}
      {resumeTemplates.length > moreItem && (
        <div className="text-center pb-8">
          <Button onClick={loadMoreItem} variant="primary" size="md">
            Show more templates ({resumeTemplates.length - moreItem} remaining)
          </Button>
        </div>
      )}
    </div>
  );
};

export default TemplatePage;
