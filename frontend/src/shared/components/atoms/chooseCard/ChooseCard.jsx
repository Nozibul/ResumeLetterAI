'use client';

/**
 * @file LeftChoose.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { getBorderColor } from '@/lib/colorsUtils';
import Image from 'next/image';
import PropTypes from 'prop-types';

const ChooseCard = ({ item, index }) => {
  const { img, title, description } = item;

  // Get border from utility functions
  const borderClass = getBorderColor(index);

  return (
    <div
      className={`
      rounded-xl p-[4px] border-1 ${borderClass} 
      hover:shadow-lg transition-all duration-300 
      hover:scale-101 group
    `}
    >
      <div className="flex items-center">
        <div className="mx-2 relative">
          <div className="rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
            <Image
              src={img}
              alt={title}
              width={50}
              height={50}
              className="rounded-full object-cover w-full h-full"
            />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold">{title}</p>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};

// proptypes validation
ChooseCard.PropTypes = {
  item: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    img: PropTypes.string,
  }),
  index: PropTypes.number.isRequired,
};

export default ChooseCard;
