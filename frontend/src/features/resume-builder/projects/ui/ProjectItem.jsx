/**
 * @file features/resume-builder/projects/ui/ProjectItem.jsx
 * @description Single project card component (extracted)
 * @author Nozibul Islam
 *
 * Self-Review:
 * ✅ Readability: Clear structure
 * ✅ Performance: Memoized
 * ✅ Security: No XSS
 * ✅ Best Practices: Reusable, modular
 * ✅ Potential Bugs: Null-safe
 * ✅ Memory Leaks: Cleanup in parent
 */

'use client';

import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import ResumeInput from '@/shared/components/atoms/resume/ResumeInput';
import ResumeTextarea from '@/shared/components/atoms/resume/ResumeTextarea';
import TechStackTags from './TechStackTags';
import { LIMITS } from '@/shared/lib/constants';

/**
 * ProjectItem Component
 * Single project card with all fields
 */
function ProjectItem({
  index,
  project,
  techSuggestions,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}) {
  // ==========================================
  // HIGHLIGHTS HANDLERS
  // ==========================================
  const handleHighlightChange = useCallback(
    (hIdx, value) => {
      const updated = [...(project.highlights || [])];
      updated[hIdx] = value;
      onUpdate(index, 'highlights', updated);
    },
    [project.highlights, index, onUpdate]
  );

  const handleAddHighlight = useCallback(() => {
    const current = project.highlights || [];
    if (current.length >= LIMITS.MAX_HIGHLIGHTS) {
      alert(`Maximum ${LIMITS.MAX_HIGHLIGHTS} highlights allowed`);
      return;
    }
    onUpdate(index, 'highlights', [...current, '']);
  }, [project.highlights, index, onUpdate]);

  const handleRemoveHighlight = useCallback(
    (hIdx) => {
      const updated = (project.highlights || []).filter((_, i) => i !== hIdx);
      onUpdate(index, 'highlights', updated);
    },
    [project.highlights, index, onUpdate]
  );

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="border-2 border-gray-200 rounded-lg p-6 bg-white hover:border-teal-300 transition-colors">
      {/* HEADER WITH CONTROLS */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Project #{index + 1}
        </h3>

        <div className="flex items-center gap-2">
          {/* Move Up */}
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
              title="Move up"
              aria-label="Move project up"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          )}

          {/* Move Down */}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
              title="Move down"
              aria-label="Move project down"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}

          {/* Delete */}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete project"
            aria-label="Delete project"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* FORM FIELDS */}
      <div className="space-y-4">
        {/* Project Name */}
        <ResumeInput
          label="Project Name"
          name="projectName"
          value={project.projectName || ''}
          onChange={(e) => onUpdate(index, 'projectName', e.target.value)}
          placeholder="E-commerce Platform"
          required
          maxLength={LIMITS.TITLE_MAX_LENGTH}
          showCounter
        />

        {/* Tech Stack (Sub-Component) */}
        <TechStackTags
          technologies={project.technologies || []}
          suggestions={techSuggestions}
          onAdd={(tech) =>
            onUpdate(index, 'technologies', [
              ...(project.technologies || []),
              tech,
            ])
          }
          onRemove={(tech) =>
            onUpdate(
              index,
              'technologies',
              (project.technologies || []).filter((t) => t !== tech)
            )
          }
        />

        {/* Description */}
        <ResumeTextarea
          label="Description"
          name="description"
          value={project.description || ''}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          placeholder="Full-stack e-commerce platform with real-time inventory management..."
          rows={3}
          maxLength={500}
          helperText="Optional but recommended"
        />

        {/* URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResumeInput
            label="Live URL"
            name="liveUrl"
            type="url"
            value={project.liveUrl || ''}
            onChange={(e) => onUpdate(index, 'liveUrl', e.target.value)}
            placeholder="https://myproject.com"
            helperText="Optional"
          />

          <ResumeInput
            label="Source Code"
            name="sourceCode"
            type="url"
            value={project.sourceCode || ''}
            onChange={(e) => onUpdate(index, 'sourceCode', e.target.value)}
            placeholder="https://github.com/user/repo"
            helperText="Optional"
          />
        </div>

        {/* Highlights */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Key Highlights & Achievements
          </label>

          <div className="space-y-2">
            {(project.highlights || ['']).map((highlight, hIdx) => (
              <div key={hIdx} className="flex items-start gap-2">
                <span className="text-gray-400 mt-3">•</span>
                <ResumeTextarea
                  label=""
                  name={`highlight-${hIdx}`}
                  value={highlight}
                  onChange={(e) => handleHighlightChange(hIdx, e.target.value)}
                  placeholder="Served 100K+ users with 99.9% uptime"
                  rows={2}
                  maxLength={300}
                  className="flex-1"
                />
                {(project.highlights || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(hIdx)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    aria-label="Remove highlight"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddHighlight}
            disabled={
              (project.highlights || []).length >= LIMITS.MAX_HIGHLIGHTS
            }
            className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Highlight ({(project.highlights || []).length}/
            {LIMITS.MAX_HIGHLIGHTS})
          </button>
        </div>
      </div>
    </div>
  );
}

ProjectItem.propTypes = {
  index: PropTypes.number.isRequired,
  project: PropTypes.object.isRequired,
  techSuggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
};

ProjectItem.defaultProps = {
  onMoveUp: null,
  onMoveDown: null,
};

export default memo(ProjectItem);
