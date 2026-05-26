'use client';
/**
 * @file features/resume-builder/work-experience/ui/ExperienceItem.jsx
 * @description Single work experience card
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * - Local dateError state + useEffect removed — errors come from parent via prop
 * - errors prop added for field-level error display
 */

import { memo } from 'react';
import PropTypes from 'prop-types';
import ResumeInput from '@/shared/components/atoms/resume/ResumeInput';
import DatePicker from '@/shared/components/atoms/resume/DatePicker';
import BulletPointsList from './BulletPointsList';
import { LIMITS } from '@/shared/lib/constants';

function ExperienceItem({
  index,
  experience,
  errors,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}) {
  return (
    <div className="border-2 border-gray-200 rounded-lg p-6 bg-white hover:border-teal-300 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Experience #{index + 1}
        </h3>

        <div className="flex items-center gap-2">
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
              aria-label="Move up"
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

          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
              aria-label="Move down"
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

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            aria-label="Delete experience"
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

      {/* Fields */}
      <div className="space-y-4">
        <ResumeInput
          label="Job Title"
          name="jobTitle"
          value={experience.jobTitle || ''}
          onChange={(e) => onUpdate(index, 'jobTitle', e.target.value)}
          placeholder="Software Engineer"
          required
          maxLength={LIMITS.TITLE_MAX_LENGTH}
          showCounter
          error={errors.jobTitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResumeInput
            label="Company"
            name="company"
            value={experience.company || ''}
            onChange={(e) => onUpdate(index, 'company', e.target.value)}
            placeholder="Google"
            required
            maxLength={LIMITS.TITLE_MAX_LENGTH}
            error={errors.company}
          />

          <ResumeInput
            label="Location"
            name="location"
            value={experience.location || ''}
            onChange={(e) => onUpdate(index, 'location', e.target.value)}
            placeholder="San Francisco, CA"
            maxLength={LIMITS.TITLE_MAX_LENGTH}
            error={errors.location}
          />
        </div>

        {/*
          DatePicker handles:
            - start date selection
            - end date selection
            - "currently working here" toggle
          error from parent errors.dateRange — no local state needed
        */}
        <DatePicker
          label="Employment Period"
          startDate={experience.startDate}
          endDate={experience.endDate}
          isCurrent={experience.currentlyWorking}
          onStartChange={(date) => onUpdate(index, 'startDate', date)}
          onEndChange={(date) => onUpdate(index, 'endDate', date)}
          onCurrentChange={(checked) => {
            onUpdate(index, 'currentlyWorking', checked);
            if (checked) onUpdate(index, 'endDate', null);
          }}
          error={errors.dateRange}
          required
          currentLabel="I currently work here"
        />

        <BulletPointsList
          responsibilities={experience.responsibilities || ['']}
          onUpdate={(responsibilities) =>
            onUpdate(index, 'responsibilities', responsibilities)
          }
        />
      </div>
    </div>
  );
}

ExperienceItem.propTypes = {
  index: PropTypes.number.isRequired,
  experience: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
};

ExperienceItem.defaultProps = {
  errors: {},
  onMoveUp: null,
  onMoveDown: null,
};

export default memo(ExperienceItem);
