/**
 * @file shared/components/atoms/coveretter/CoverLetterTextarea.jsx
 * @description Reusable textarea for cover letter job description input
 * @author Nozibul Islam
 *
 * Features:
 * - Character counter (bottom-right)
 * - Error state
 * - Max length enforcement
 */

'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';

function CoverLetterTextarea({
  label,
  name,
  value = '',
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
  const textareaId = `cover-letter-textarea-${name}`;
  const errorId = `${textareaId}-error`;

  const safeValue = value || '';
  const charCount = safeValue.length;
  const remainingChars = maxLength ? maxLength - charCount : null;
  const isOverLimit = maxLength && charCount > maxLength;
  const isNearLimit =
    maxLength &&
    remainingChars !== null &&
    remainingChars <= 100 &&
    remainingChars > 0;

  return (
    <div className={className}>
      <label
        htmlFor={textareaId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <textarea
          id={textareaId}
          name={name}
          value={safeValue}
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

      {hasError && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {isOverLimit && (
        <p className="mt-1 text-sm text-red-600">
          ⚠️ Text is too long. Please reduce by {charCount - maxLength}{' '}
          characters.
        </p>
      )}

      {!hasError && !isOverLimit && helperText && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

CoverLetterTextarea.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
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

CoverLetterTextarea.defaultProps = {
  value: '',
  onBlur: () => {},
  placeholder: '',
  required: false,
  rows: 8,
  maxLength: 5000,
  error: null,
  touched: false,
  disabled: false,
  className: '',
  helperText: '',
};

export default memo(CoverLetterTextarea);
