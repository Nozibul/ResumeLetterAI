/**
 * @file RatingDisplay.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */
import { Star } from 'lucide-react';
import { memo } from 'react';

const RatingDisplay = memo(
  ({ rating = 4.9, totalReviews = '1.1k', className = '' }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`w-4 h-4 ${
                index < fullStars
                  ? 'fill-teal-400 text-teal-400'
                  : index === fullStars && hasHalfStar
                    ? 'fill-teal-200 text-teal-400'
                    : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {rating}/5 ({totalReviews} reviews)
        </span>
      </div>
    );
  }
);
export default RatingDisplay;
