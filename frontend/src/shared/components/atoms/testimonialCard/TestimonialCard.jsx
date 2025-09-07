/**
 * @file TestimonialCard.jsx
 * @description Molecule component for displaying testimonial card
 */

import PropTypes from 'prop-types';
import clsx from 'clsx';
import { QuoteIcon } from '../quoteIcon/QuoteIcon';

export const TestimonialCard = ({
  quote,
  name,
  title,
  company,
  borderColor,
  quoteColor,
}) => {
  return (
    <article
      className={clsx(
        'relative rounded-2xl p-6 border-4 bg-black backdrop-blur-md',
        borderColor
      )}
      role="article"
      aria-label={`Testimonial from ${name}`}
    >
      {/* Quote Icon */}
      <div className="mb-6">
        <QuoteIcon color={quoteColor} />
      </div>

      {/* Quote Text */}
      <blockquote className="text-white text-lg leading-relaxed mb-8 font-normal">
        {quote}
      </blockquote>

      {/* Author Info */}
      <footer className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-white font-semibold text-base mb-1">
            {name}
          </span>
          <span className="text-gray-400 text-sm">
            {title}, {company}
          </span>
        </div>
      </footer>
    </article>
  );
};

TestimonialCard.propTypes = {
  quote: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  company: PropTypes.string.isRequired,
  borderColor: PropTypes.string,
  quoteColor: PropTypes.string,
};

TestimonialCard.defaultProps = {
  borderColor: 'border-gray-500',
  quoteColor: 'text-gray-400',
};
