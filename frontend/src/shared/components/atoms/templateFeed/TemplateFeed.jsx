'use client';

/**
 * @file TemplateFeed.jsx
 * @author Nozibul Islam
 * @copyright (c) 2025 ResumeLetterAI
 * @license MIT
 */

import Image from 'next/image';
import PropTypes from 'prop-types';

const TemplateFeed = ({ feedImage }) => {
  const imageStyle = {
    width: '600px',
    height: '630px',
  };

  // fallback logic
  if (!feedImage) {
    return (
      <div className="flex items-center justify-center w-full h-full text-gray-400">
        No preview available
      </div>
    );
  }
  return (
    <div className="shadow-sm">
      <Image
        src={feedImage}
        alt="Resume Template Preview"
        width={500}
        height={500}
        style={imageStyle}
        priority
      />
    </div>
  );
};

TemplateFeed.propTypes = {
  feedImage: PropTypes.string.isRequired,
};

export default TemplateFeed;
