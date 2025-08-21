/**
 * @file FeatureBadge.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import React, { memo } from 'react';
import Icon from '../../atoms/icons/Icon';

const FeatureBadge = memo(({ icon, text, color = 'blue', className = '' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full border ${colors[color]} ${className}`}
    >
      <Icon iconName={icon} size="sm" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
});

export default FeatureBadge;
