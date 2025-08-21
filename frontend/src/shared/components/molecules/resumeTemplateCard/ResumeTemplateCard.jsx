/**
 * @file ResumeTemplateCard.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */
import { memo } from 'react';
import Typography from '../../atoms/typography/Typography';
import Icon from '../../atoms/icons/Icon';

const ResumeTemplateCard = memo(
  ({ template, isActive = false, delay = 0, onClick, className = '' }) => {
    const { title, color = 'blue', preview = {} } = template;

    const colorGradients = {
      blue: 'from-blue-400 to-blue-600',
      green: 'from-green-400 to-green-600',
      purple: 'from-purple-400 to-purple-600',
      orange: 'from-orange-400 to-orange-600',
      red: 'from-red-400 to-red-600',
    };

    return (
      <div
        className={`
          w-48 h-64 bg-white rounded-xl shadow-lg border-2 p-4 transition-all duration-300
          ${
            isActive
              ? 'border-blue-300 shadow-2xl scale-105'
              : 'border-gray-200 hover:border-blue-200 hover:shadow-xl hover:scale-102'
          }
          group-hover:rotate-1 ${className}
        `}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      >
        {/* Template Header */}
        <div
          className={`h-8 bg-gradient-to-r ${colorGradients[color]} rounded-lg mb-3 flex items-center px-3`}
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

          <div className="pt-2 space-y-1">
            <div className="h-1 bg-gray-100 rounded w-full"></div>
            <div className="h-1 bg-gray-100 rounded w-5/6"></div>
            <div className="h-1 bg-gray-100 rounded w-4/5"></div>
          </div>

          <div className="pt-2 space-y-1">
            <div className="h-1 bg-gray-100 rounded w-full"></div>
            <div className="h-1 bg-gray-100 rounded w-3/4"></div>
            <div className="h-1 bg-gray-100 rounded w-5/6"></div>
          </div>
        </div>

        {/* Template Footer */}
        <div className="absolute bottom-3 left-4 right-4">
          <Typography
            variant="caption"
            className="text-center font-medium text-gray-700"
          >
            {title}
          </Typography>
        </div>

        {/* Active Indicator */}
        {isActive && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Icon name="star" size="sm" className="text-white fill-current" />
          </div>
        )}
      </div>
    );
  }
);

export default ResumeTemplateCard;
