'use client';
/**
 * @file ReviewCard.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Quote } from 'lucide-react';
import RatingDisplay from '../../atoms/ratingDisplay/RatingDisplay';
import Image from 'next/image';

const ReviewCard = memo(({ review, isVisible = true }) => {
  return (
    <>
      <div className="w-full max-w-sm mx-auto min-h-[280px] xs:min-h-[320px] sm:min-h-[360px] md:min-h-[380px] lg:min-h-[400px] p-2 xs:p-3 sm:p-4 transition-all duration-700">
        <div
          className="h-full border border-amber-50 bg-white rounded-xl sm:rounded-xl shadow-lg hover:shadow-xl sm:hover:shadow-xl transition-all duration-700 ease-in-out p-3 xs:p-4 sm:p-5 md:p-6 flex flex-col relative overflow-hidden group hover:scale-[1.02] sm:hover:scale-[1.03]"
          role="article"
          aria-label={`Review by ${review.name}`}
        >
          {/* Top Gradient Line */}
          <div
            className="absolute top-0 left-0 w-full h-0.5 sm:h-1 bg-gradient-to-r from-teal-500 via-purple-400 to-indigo-500 group-hover:h-1 sm:group-hover:h-1.5 transition-all duration-500"
            aria-hidden="true"
          ></div>

          {/* Quote Icon */}
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div
              className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-50 to-teal-50 group-hover:from-purple-100 group-hover:to-teal-100 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm"
              aria-hidden="true"
            >
              <Quote className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-teal-600 group-hover:text-teal-700 transition-colors duration-300" />
            </div>
          </div>

          {/* Review Text */}
          <div className="flex-1 mb-4 sm:mb-5 md:mb-6">
            <blockquote className="text-gray-700 group-hover:text-gray-800 text-xs xs:text-sm sm:text-base md:text-base leading-relaxed xs:leading-relaxed sm:leading-7 transition-colors duration-300 line-clamp-4 xs:line-clamp-5 sm:line-clamp-none">
              "{review.review}"
            </blockquote>
          </div>

          {/* Rating */}
          <div className="mb-3 sm:mb-4 flex justify-start">
            <div className="bg-gray-50 group-hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors duration-300">
              <RatingDisplay rating={4.9} />
            </div>
          </div>

          {/* Reviewer Info */}
          <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mt-auto">
            <div className="lg:w-18 lg:h-18 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden ring-1 xs:ring-2 ring-purple-100 group-hover:ring-purple-200 transition-all duration-300 flex-shrink-0">
              <Image
                src={review.avatar}
                width={100}
                height={100}
                alt={`Portrait of ${review.name}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading={isVisible ? 'eager' : 'lazy'}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-gray-900 group-hover:text-gray-950 text-xs xs:text-sm sm:text-base transition-colors duration-300 truncate">
                {review.name}
              </h4>
              <p className="text-xs sm:text-sm text-purple-600 group-hover:text-purple-700 font-medium transition-colors duration-300 truncate">
                {review.position}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300 truncate">
                {review.company}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

ReviewCard.displayName = 'ReviewCard';

ReviewCard.propTypes = {
  review: PropTypes.shape({
    name: PropTypes.string.isRequired,
    review: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    avatar: PropTypes.string,
    position: PropTypes.string,
    company: PropTypes.string,
  }).isRequired,
  isVisible: PropTypes.bool,
};

export default ReviewCard;
