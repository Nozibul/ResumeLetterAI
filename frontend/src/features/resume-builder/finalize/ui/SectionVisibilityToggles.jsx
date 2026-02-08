/**
 * @file features/resume-builder/finalize/ui/SectionVisibilityToggles.jsx
 * @description Section visibility toggles component
 * @author Nozibul Islam
 *
 * Self-Review:
 * ✅ Readability: Clear
 * ✅ Performance: Memoized
 * ✅ Security: No XSS
 * ✅ Best Practices: Accessible
 * ✅ Potential Bugs: None
 * ✅ Memory Leaks: None
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * SectionVisibilityToggles Component
 * Toggle section visibility
 */
function SectionVisibilityToggles({ visibility, onToggle }) {
  const sections = [
    {
      key: 'personalInfo',
      label: 'Personal Information',
      icon: '👤',
      required: true,
    },
    { key: 'summary', label: 'Professional Summary', icon: '📝' },
    { key: 'workExperience', label: 'Work Experience', icon: '💼' },
    { key: 'projects', label: 'Projects', icon: '🚀' },
    { key: 'skills', label: 'Technical Skills', icon: '⚡' },
    { key: 'education', label: 'Education', icon: '🎓' },
    {
      key: 'competitiveProgramming',
      label: 'Competitive Programming',
      icon: '🏆',
    },
    { key: 'certifications', label: 'Certifications', icon: '📜' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Section Visibility
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Toggle which sections appear in your resume
      </p>

      <div className="space-y-2">
        {sections.map((section) => (
          <label
            key={section.key}
            className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
              section.required
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{section.icon}</span>
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {section.label}
                </span>
                {section.required && (
                  <span className="ml-2 text-xs text-gray-500">(Required)</span>
                )}
              </div>
            </div>

            <input
              type="checkbox"
              checked={visibility[section.key]}
              onChange={() => !section.required && onToggle(section.key)}
              disabled={section.required}
              className="w-5 h-5 accent-teal-600 border-gray-300 rounded focus:ring-teal-500 disabled:cursor-not-allowed"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          💡 <strong>Tip:</strong> Hide sections that are empty or not relevant
          to the job you're applying for.
        </p>
      </div>
    </div>
  );
}

SectionVisibilityToggles.propTypes = {
  visibility: PropTypes.object.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default memo(SectionVisibilityToggles);
