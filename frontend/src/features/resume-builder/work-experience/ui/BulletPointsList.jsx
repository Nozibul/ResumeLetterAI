'use client';
/**
 * @file features/resume-builder/work-experience/ui/BulletPointsList.jsx
 * @description Responsibilities bullet points list
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * - alert → toast.error
 * - key uses content-based stable identifier
 */

import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import ResumeTextarea from '@/shared/components/atoms/resume/ResumeTextarea';
import { LIMITS } from '@/shared/lib/constants';

function BulletPointsList({ responsibilities, onUpdate }) {
  const handleChange = useCallback(
    (index, value) => {
      const updated = [...responsibilities];
      updated[index] = value;
      onUpdate(updated);
    },
    [responsibilities, onUpdate]
  );

  const handleAdd = useCallback(() => {
    if (responsibilities.length >= LIMITS.MAX_RESPONSIBILITIES) {
      toast.error(`Maximum ${LIMITS.MAX_RESPONSIBILITIES} bullets allowed`);
      return;
    }
    onUpdate([...responsibilities, '']);
  }, [responsibilities, onUpdate]);

  const handleRemove = useCallback(
    (index) => {
      const updated = responsibilities.filter((_, i) => i !== index);
      onUpdate(updated.length > 0 ? updated : ['']);
    },
    [responsibilities, onUpdate]
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Key Responsibilities & Achievements
      </label>

      <div className="space-y-2">
        {responsibilities.map((resp, index) => (
          <div
            key={`resp-${index}-${resp.slice(0, 10)}`}
            className="flex items-start gap-2"
          >
            <span className="text-gray-400 mt-3">•</span>

            <ResumeTextarea
              label=""
              name={`responsibility-${index}`}
              value={resp}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder="Led development of microservices, reducing latency by 40%"
              rows={2}
              maxLength={500}
              className="flex-1"
            />

            {responsibilities.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                aria-label="Remove bullet point"
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
        onClick={handleAdd}
        disabled={responsibilities.length >= LIMITS.MAX_RESPONSIBILITIES}
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
        Add Bullet Point ({responsibilities.length}/
        {LIMITS.MAX_RESPONSIBILITIES})
      </button>

      <p className="text-xs text-gray-500">
        💡 Start with action verbs (Led, Developed, Managed) and include metrics
      </p>
    </div>
  );
}

BulletPointsList.propTypes = {
  responsibilities: PropTypes.arrayOf(PropTypes.string).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default memo(BulletPointsList);
