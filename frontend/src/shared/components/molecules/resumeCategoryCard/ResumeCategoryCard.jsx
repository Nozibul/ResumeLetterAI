'use client';
import { memo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Typography from '../../atoms/typography/Typography';
import Icon from '../../atoms/icons/Icon';

// Predefined Tailwind classes
const colorGradients = {
  blue: 'from-blue-400 to-blue-600',
  green: 'from-green-400 to-green-600',
  orange: 'from-orange-400 to-orange-700',
  purple: 'from-purple-400 to-purple-600',
  amber: 'from-amber-300 to-amber-500',
};

const borderColors = {
  blue: 'border-blue-400',
  green: 'border-green-400',
  orange: 'border-orange-400',
  purple: 'border-purple-400',
  amber: 'border-amber-400',
};

const ResumeCategoryCard = memo(
  ({ template, isActive = true, onClick, className = '' }) => {
    const { category, color = 'blue' } = template;

    return (
      <>
        <div
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
          className={clsx(
            'w-48 h-66 bg-white rounded-xl shadow-lg border-2 p-4 transition-transform duration-300 cursor-pointer relative transform',
            isActive
              ? clsx(borderColors[color], 'shadow-2xl scale-110 z-10')
              : 'border-gray-200 hover:border-blue-200 hover:shadow-xl hover:scale-102',
            'hover:rotate-1',
            className
          )}
        >
          {/* Template Header */}
          <div
            className={clsx(
              'h-8 bg-gradient-to-r rounded-lg mb-3 flex items-center px-3 transition-all duration-300',
              colorGradients[color]
            )}
          >
            <div className="w-6 h-6 bg-white rounded-full opacity-90 flex items-center justify-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            </div>
            <div className="ml-auto flex space-x-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-white rounded-full opacity-70"
                ></div>
              ))}
            </div>
          </div>

          {/* Template Content */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded w-2/3"></div>
            <div className="h-2 bg-gray-200 rounded w-2/3"></div>

            <div className="pt-2 space-y-1">
              <div className="h-1 bg-gray-100 rounded w-full"></div>
              <div className="h-1 bg-gray-100 rounded w-5/6"></div>
              <div className="h-1 bg-gray-100 rounded w-4/5"></div>
              <div className="h-1 bg-gray-100 rounded w-4/5"></div>
            </div>

            <div className="pt-2 space-y-1">
              <div className="h-1 bg-gray-100 rounded w-full"></div>
              <div className="h-1 bg-gray-100 rounded w-3/4"></div>
              <div className="h-1 bg-gray-100 rounded w-5/6"></div>
              <div className="h-1 bg-gray-100 rounded w-5/6"></div>
            </div>
          </div>

          {/* Template Footer */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <Typography
              variant="caption"
              className="font-semibold text-gray-700"
            >
              {category}
            </Typography>
          </div>

          {/* Cycling Border Icons - Only show when cycling */}
          {isActive && (
            <>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center animate-spin 100s liniar infinite">
                <Icon
                  iconName="sparkles"
                  size="sm"
                  className={`text-${color}-500`}
                />
              </div>

              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center animate-spin 100s liniar infinite">
                <Icon
                  iconName="sparkles"
                  size="sm"
                  className={`text-${color}-500`}
                />
              </div>
            </>
          )}
        </div>
      </>
    );
  }
);

ResumeCategoryCard.propTypes = {
  template: PropTypes.shape({
    category: PropTypes.string.isRequired,
    color: PropTypes.oneOf(['blue', 'green', 'orange', 'purple', 'amber']),
  }).isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default ResumeCategoryCard;
