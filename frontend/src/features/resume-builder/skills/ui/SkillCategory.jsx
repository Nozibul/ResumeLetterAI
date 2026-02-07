/**
 * @file features/resume-builder/skills/ui/SkillCategory.jsx
 * @description Single skill category component
 * @author Nozibul Islam
 *
 * Self-Review:
 * ✅ Readability: Clear structure
 * ✅ Performance: Memoized
 * ✅ Security: No XSS
 * ✅ Best Practices: Reusable
 * ✅ Potential Bugs: Null-safe
 * ✅ Memory Leaks: None
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';
import TagInput from '@/shared/components/atoms/resume/TagInput';
import { LIMITS } from '@/shared/lib/constants';

/**
 * SkillCategory Component
 * Single skill category with tag input
 */
function SkillCategory({
  name,
  label,
  skills,
  suggestions,
  onAdd,
  onRemove,
  icon,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-teal-300 transition-colors">
      {/* Header with Icon */}
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <h3 className="text-base font-semibold text-gray-900">{label}</h3>
        <span className="text-xs text-gray-500">
          ({skills.length}/{LIMITS.MAX_SKILLS_PER_CATEGORY})
        </span>
      </div>

      {/* Tag Input */}
      <TagInput
        label=""
        name={name}
        tags={skills}
        onAdd={onAdd}
        onRemove={onRemove}
        suggestions={suggestions}
        maxTags={LIMITS.MAX_SKILLS_PER_CATEGORY}
        placeholder={`Add ${label.toLowerCase()} (press Enter)`}
      />
    </div>
  );
}

SkillCategory.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  skills: PropTypes.arrayOf(PropTypes.string).isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  icon: PropTypes.string,
};

SkillCategory.defaultProps = {
  icon: null,
};

export default memo(SkillCategory);
