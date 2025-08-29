'use client';

/**
 * @file ContentFeed.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * ContentFeed component displays a scrollable list of resume items
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of resume items to display
 * @param {number} props.active - ID of currently active item
 * @param {Function} props.setActive - Function to set active item
 */
const ContentFeed = ({ items = [], active, setActive }) => {
  const handleItemClick = (itemId) => {
    setActive?.(itemId);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-teal-50 via-white to-teal-100 rounded-2xl p-8 lg:col-span-1">
        <h1 className="text-xl font-bold mb-4">Resume Feed</h1>

        <div className="lg:h-[450px] custom-scrollbar overflow-y-auto space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={clsx(
                'p-4 rounded-lg cursor-pointer transition-colors',
                active === item.id
                  ? 'bg-teal-100 border-l-4 border-teal-500 text-gray-700'
                  : 'bg-gray-100 hover:bg-gray-200'
              )}
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-600">
                {item.category} • {item.time}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// PropTypes validation
ContentFeed.propsTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
    })
  ),
  active: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setActive: PropTypes.func.isRequired,
};

// Default props
ContentFeed.defaultProps = {
  item: [],
  active: 1,
};

export default ContentFeed;
