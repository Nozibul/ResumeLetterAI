/**
 * @file TestimonialsSection.jsx
 * @author Nozibul Islam
 * @description Testimonials section component displaying customer recommendations
 * @version 1.0.0
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { TestimonialCard } from '../../../shared/components/atoms/testimonialCard/TestimonialCard';
import { TESTIMONIALS_DATA } from '../../../local-data/testimonials-data';

// CSS classes object for better organization
const styles = {
  section: 'mt-14 p-10 sm:px-6 lg:px-8',
  container: 'mx-auto h-[500px] max-w-6xl',
  grid: 'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2',
  leftColumn: 'flex items-start justify-start',
  rightColumn: 'flex items-end justify-end mt-32',
};

/**
 * TestimonialsSection Component
 *
 * Renders a section containing customer testimonials in a responsive grid layout.
 * Left testimonial aligns to top-left, right testimonial aligns to bottom-right.
 *
 * @returns {JSX.Element} The testimonials section component
 */
export const TestimonialsSection = () => {
  const [left, right] = TESTIMONIALS_DATA;

  return (
    <section
      className={styles.section}
      aria-label="Customer testimonials"
      role="region"
    >
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left testimonial - aligned to start */}
          <div className={styles.leftColumn}>
            <TestimonialCard
              key={left.id}
              quote={left.quote}
              name={left.name}
              title={left.title}
              company={left.company}
              borderColor={left.borderColor}
              quoteColor={left.quoteColor}
            />
          </div>

          {/* Right testimonial - aligned to end */}
          <div className={styles.rightColumn}>
            <TestimonialCard
              key={right.id}
              quote={right.quote}
              name={right.name}
              title={right.title}
              company={right.company}
              borderColor={right.borderColor}
              quoteColor={right.quoteColor}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
