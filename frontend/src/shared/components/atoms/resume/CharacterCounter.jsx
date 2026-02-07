/**
 * @file shared/components/atoms/resume/CharacterCounter.jsx
 * @description Reusable character counter
 * @author Nozibul Islam
 *
 * Features:
 * - Color-coded (gray/yellow/red)
 * - Shows current/max
 * - Responsive
 *
 * Quality Checks:
 * ✅ Readability: Simple logic
 * ✅ Performance: Memoized
 * ✅ Security: Safe display
 * ✅ Best Practices: Clean
 * ✅ Accessibility: Color + text
 */

'use client';

import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * CharacterCounter Component
 */
function CharacterCounter({ current, max, className }) {
  const isOverLimit = current > max;
  const isNearLimit = !isOverLimit && max - current <= 50;

  const colorClass = useMemo(() => {
    if (isOverLimit) return 'text-red-600';
    if (isNearLimit) return 'text-yellow-600';
    return 'text-gray-500';
  }, [isOverLimit, isNearLimit]);

  return (
    <span className={`text-xs font-medium ${colorClass} ${className}`}>
      {current} / {max}
    </span>
  );
}

CharacterCounter.propTypes = {
  current: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  className: PropTypes.string,
};

CharacterCounter.defaultProps = {
  className: '',
};

export default memo(CharacterCounter);
