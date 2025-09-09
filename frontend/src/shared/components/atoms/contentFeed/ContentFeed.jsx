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
import { useEffect, useState } from 'react';
import { formatCategoryName } from '@/lib/formatCategoryName';

const ContentFeed = ({ resumeFeed = [], active, setActive }) => {
  const [items, setItems] = useState([]);
  const handleItemClick = (itemId) => {
    setActive(itemId);
  };

  useEffect(() => {
    setItems(
      resumeFeed.map((allItem) => ({
        ...allItem,
        category: formatCategoryName(allItem.category),
      }))
    );
  }, [resumeFeed]);

  return (
    <>
      <div className="bg-gradient-to-br from-teal-50 via-white to-teal-100 rounded-2xl p-8 lg:col-span-1">
        <h1 className="text-2xl text-center font-bold mb-4">Resume Feed</h1>

        <div className="lg:h-[500px] custom-scrollbar overflow-y-auto space-y-4">
          {items?.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={clsx(
                'p-4 rounded-lg cursor-pointer transition-colors',
                active === item.id
                  ? 'bg-teal-100 border-l-4 border-teal-500 text-black'
                  : 'bg-gray-100 hover:bg-gray-200'
              )}
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-xs text-gray-600">{item.category}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// PropTypes validation
ContentFeed.propsTypes = {
  resumeFeed: PropTypes.arrayOf(
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
  active: '1',
};

export default ContentFeed;
