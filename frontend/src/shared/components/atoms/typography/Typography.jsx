/**
 * @file typography.jsx
 * @author Nozibul Islam
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { memo } from 'react';

const Typography = memo(
  ({ variant = 'body', children, className = '', as: Component, ...props }) => {
    const variants = {
      h1: 'text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight',
      h2: 'text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight',
      h3: 'text-xl md:text-2xl font-bold font-family-sans text-gray-900 leading-tight',
      h4: 'text-lg md:text-xl font-semibold text-gray-900',
      lead: 'text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed',
      body: 'text-base md:text-lg text-gray-800 mt-2 leading-relaxed',
      caption: 'text-md font-semibold text-gray-600',
      small: 'text-sm text-gray-600',
    };

    const defaultTags = {
      hero: 'h1',
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      lead: 'p',
      body: 'p',
      small: 'span',
      caption: 'span',
    };

    const Tag = Component || defaultTags[variant] || 'p';

    // Hero variant highlight logic (odd → middle word, even → 2 middle words)
    const renderHero = (text) => {
      const parts = text.split(' ');
      const len = parts.length;

      return parts.map((word, i) => {
        let isHighlight = false;

        if (len % 2 === 0) {
          // even → middle two words
          const mid1 = len / 2 - 1;
          const mid2 = len / 2;
          isHighlight = i === mid1 || i === mid2;
        } else {
          // odd → single middle word
          const mid = Math.floor(len / 2);
          isHighlight = i === mid;
        }

        return (
          <span
            key={i}
            className={
              isHighlight
                ? 'bg-gradient-to-r from-blue-600 to-purple-300 bg-clip-text text-transparent'
                : ''
            }
          >
            {word}{' '}
          </span>
        );
      });
    };

    return (
      <Tag className={`${variants[variant]} ${className}`} {...props}>
        {(variant === 'h1' || variant === 'h2') && typeof children === 'string'
          ? renderHero(children)
          : children}
      </Tag>
    );
  }
);

export default Typography;
