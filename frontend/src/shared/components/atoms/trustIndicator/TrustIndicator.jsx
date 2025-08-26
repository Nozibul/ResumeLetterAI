/**
 * @file TrustIndicator.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { memo } from 'react';
import { User } from 'lucide-react';

const TrustIndicator = memo(
  ({ value, text, className = '', showIcon = true }) => {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showIcon && <User className="text-teal-600" />}
        <span className="font-semibold text-gray-700">{value}</span>
        <span className=" text-gray-600">{text}</span>
      </div>
    );
  }
);

export default TrustIndicator;
