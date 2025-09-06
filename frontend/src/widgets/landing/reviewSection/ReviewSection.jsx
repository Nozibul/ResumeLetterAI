'use client';
/**
 * @file ReviewSection.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { ReviewCarousel } from '@/shared/components/organisms/reviewCarousel/ReviewCarousel';

export default function ReviewSection(props) {
  try {
    return (
      <section className="py-20">
        <ReviewCarousel {...props} />
      </section>
    );
  } catch (error) {
    console.error('ReviewSection Error:', error);
    return (
      <section
        className="py-20 bg-gray-50 text-center"
        data-testid="section-reviews-error"
      >
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to load reviews
          </h3>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </section>
    );
  }
}
