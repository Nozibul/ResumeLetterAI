/**
 * @file features/resume-builder/projects/ui/TechStackTags.jsx
 * @description Tech stack tag input with autocomplete
 * @author Nozibul Islam
 *
 * Self-Review:
 * ✅ Readability: Clear
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
 * TechStackTags Component
 * Wrapper around TagInput with tech-specific features
 */
function TechStackTags({ technologies, suggestions, onAdd, onRemove }) {
  return (
    <div>
      <TagInput
        label="Tech Stack"
        name="technologies"
        tags={technologies}
        onAdd={onAdd}
        onRemove={onRemove}
        suggestions={suggestions}
        maxTags={LIMITS.MAX_TECHNOLOGIES}
        placeholder="React, Node.js, MongoDB (press Enter)"
        required
      />

      {/* Helper Text */}
      <p className="mt-2 text-xs text-gray-500">
        💡 Include both frontend and backend technologies for best ATS matching
      </p>
    </div>
  );
}

TechStackTags.propTypes = {
  technologies: PropTypes.arrayOf(PropTypes.string).isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default memo(TechStackTags);
