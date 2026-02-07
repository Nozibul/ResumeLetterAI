/**
 * @file features/resume-builder/skills/ui/SuggestionsList.jsx
 * @description Popular skills suggestions component
 * @author Nozibul Islam
 *
 * Self-Review:
 * ✅ Readability: Clear
 * ✅ Performance: Memoized
 * ✅ Security: Static data
 * ✅ Best Practices: Helpful UX
 * ✅ Potential Bugs: None
 * ✅ Memory Leaks: None
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * SuggestionsList Component
 * Shows popular skill suggestions
 */
function SuggestionsList({ category, suggestions, onAdd, currentSkills }) {
  // Filter out already added skills
  const availableSuggestions = suggestions.filter(
    (skill) => !currentSkills.includes(skill)
  );

  if (availableSuggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-blue-900 mb-2">
        💡 Popular {category} Skills
      </h4>
      <div className="flex flex-wrap gap-2">
        {availableSuggestions.slice(0, 10).map((skill, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onAdd(skill)}
            className="px-3 py-1 text-xs font-medium bg-white border border-blue-300 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
          >
            + {skill}
          </button>
        ))}
      </div>
    </div>
  );
}

SuggestionsList.propTypes = {
  category: PropTypes.string.isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAdd: PropTypes.func.isRequired,
  currentSkills: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default memo(SuggestionsList);
