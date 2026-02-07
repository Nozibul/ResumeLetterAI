/**
 * @file shared/components/atoms/resume/ResumeTextarea.jsx
 * @description Reusable textarea for resume forms
 * @author Nozibul Islam
 *
 * Features:
 * - Character counter (bottom-right)
 * - Error state
 * - Auto-resize option
 * - Max length enforcement
 *
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * ResumeTextarea Component
 */
function ResumeTextarea({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required,
  rows,
  maxLength,
  error,
  touched,
  disabled,
  className,
  helperText,
}) {
  const hasError = error && touched;
  const textareaId = `resume-textarea-${name}`;
  const errorId = `${textareaId}-error`;

  // Character count state
  const charCount = value.length;
  const remainingChars = maxLength ? maxLength - charCount : null;
  const isOverLimit = maxLength && charCount > maxLength;
  const isNearLimit =
    maxLength &&
    remainingChars !== null &&
    remainingChars <= 100 &&
    remainingChars > 0;

  return (
    <div className={className}>
      {/* Label */}
      <label
        htmlFor={textareaId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Textarea Container (for counter positioning) */}
      <div className="relative">
        <textarea
          id={textareaId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          aria-required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={`
            w-full px-4 py-3 border rounded-lg resize-none
            focus:outline-none focus:ring-2 transition-colors
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${
              hasError || isOverLimit
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-teal-500'
            }
          `}
        />

        {/* Character Counter (Bottom-right) */}
        {maxLength && (
          <div className="absolute bottom-3 right-3">
            <span
              className={`
                text-xs font-medium px-2 py-1 rounded
                ${
                  isOverLimit
                    ? 'bg-red-100 text-red-700'
                    : isNearLimit
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-600'
                }
              `}
            >
              {charCount} / {maxLength}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Over Limit Warning */}
      {isOverLimit && (
        <p className="mt-1 text-sm text-red-600">
          ⚠️ Text is too long. Please reduce by {charCount - maxLength}{' '}
          characters.
        </p>
      )}

      {/* Helper Text */}
      {!hasError && !isOverLimit && helperText && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

ResumeTextarea.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  error: PropTypes.string,
  touched: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  helperText: PropTypes.string,
};

ResumeTextarea.defaultProps = {
  onBlur: () => {},
  placeholder: '',
  required: false,
  rows: 4,
  maxLength: null,
  error: null,
  touched: false,
  disabled: false,
  className: '',
  helperText: '',
};

export default memo(ResumeTextarea);
