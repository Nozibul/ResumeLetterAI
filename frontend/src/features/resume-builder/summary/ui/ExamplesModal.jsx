/**
 * @file features/resume-builder/summary/ui/ExamplesModal.jsx
 * @description Pre-written summary examples modal
 * @author Nozibul Islam
 *
 * Self-Review:
 * ✅ Readability: Clear structure
 * ✅ Performance: Memoized
 * ✅ Security: No XSS (static data)
 * ✅ Best Practices: Accessible modal
 * ✅ Potential Bugs: Escape key handler
 * ✅ Memory Leaks: Event listener cleanup
 */

'use client';

import { memo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * ExamplesModal Component
 * Shows pre-written summary examples by role
 */
function ExamplesModal({ isOpen, onClose, onSelectExample }) {
  // ==========================================
  // ESCAPE KEY HANDLER
  // ==========================================
  const handleEscape = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  // ==========================================
  // EXAMPLES DATA
  // ==========================================
  const examples = [
    {
      category: 'Full-Stack',
      title: 'Full-Stack Developer',
      text: 'Full-stack developer with 4+ years of experience building responsive web applications using React, Node.js, and PostgreSQL. Delivered 15+ production-ready projects handling 500K+ monthly active users. Reduced page load times by 60% through code optimization and caching strategies. Strong focus on clean architecture and test-driven development.',
    },
    {
      category: 'Frontend',
      title: 'Frontend Engineer',
      text: 'Frontend engineer specializing in React and TypeScript with 3+ years of experience. Built and maintained component libraries serving 50+ internal applications. Improved web accessibility (WCAG AA compliance) across 20+ pages. Led migration from JavaScript to TypeScript, reducing bugs by 35%.',
    },
    {
      category: 'Backend',
      title: 'Backend Engineer',
      text: 'Backend engineer with expertise in Node.js, Python, and microservices architecture. Designed and deployed scalable APIs processing 10M+ requests daily with 99.95% uptime. Optimized database queries reducing response times by 70%. Implemented CI/CD pipelines cutting deployment time from hours to minutes.',
    },
    {
      category: 'DevOps',
      title: 'DevOps Engineer',
      text: 'DevOps engineer with 5+ years managing cloud infrastructure on AWS and GCP. Automated deployment processes for 30+ microservices using Docker and Kubernetes. Reduced infrastructure costs by 45% through resource optimization. Implemented monitoring systems catching 95% of issues before production impact.',
    },
    {
      category: 'Mobile',
      title: 'Mobile Developer',
      text: 'Mobile developer with 4+ years building iOS and Android applications using React Native and Flutter. Launched 10+ apps with 1M+ combined downloads. Improved app performance reducing crash rates from 3% to 0.2%. Strong focus on intuitive UI/UX and native platform integration.',
    },
    {
      category: 'Entry-Level',
      title: 'Junior Developer',
      text: 'Recent Computer Science graduate with strong foundation in data structures, algorithms, and full-stack development. Completed 3 internships building web applications using React and Django. Contributed to open-source projects with 100+ GitHub stars. Solved 500+ LeetCode problems demonstrating problem-solving skills.',
    },
  ];

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden animate-modal-enter">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 id="modal-title" className="text-xl font-bold text-gray-900">
              Pre-Written Summary Examples
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Close modal"
            >
              <svg
                className="h-6 w-6"
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
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-6">
            <div className="space-y-4">
              {examples.map((example, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-teal-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Category Badge */}
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-teal-100 text-teal-700 rounded mb-2">
                        {example.category}
                      </span>

                      {/* Title */}
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        {example.title}
                      </h4>

                      {/* Text */}
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {example.text}
                      </p>
                    </div>

                    {/* Use Button */}
                    <button
                      onClick={() => {
                        onSelectExample(example.text);
                        onClose();
                      }}
                      className="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    >
                      Use This
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Customization Tip */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>💡 Tip:</strong> These are templates. Customize them
                with your actual experience, skills, and achievements for best
                results!
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

ExamplesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectExample: PropTypes.func.isRequired,
};

export default memo(ExamplesModal);
