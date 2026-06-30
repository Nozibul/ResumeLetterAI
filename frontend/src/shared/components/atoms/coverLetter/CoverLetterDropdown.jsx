/**
 * @file shared/components/atoms/coverLetter/CoverLetterDropdown.jsx
 * @description Reusable dropdown for tone and resume source selection
 * @author Nozibul Islam
 */

'use client';

import { memo } from 'react';
import { ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';

function CoverLetterDropdown({
  label,
  name,
  value,
  onChange,
  options,
  error,
  touched,
  disabled,
  className,
}) {
  const hasError = error && touched;
  const selectId = `cover-letter-dropdown-${name}`;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={hasError}
          className={`
            w-full px-4 py-3 pr-10 border rounded-lg appearance-none
            bg-white cursor-pointer
            focus:outline-none focus:ring-2 transition-colors
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${
              hasError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-teal-500'
            }
          `}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>

      {hasError && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

CoverLetterDropdown.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  error: PropTypes.string,
  touched: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

CoverLetterDropdown.defaultProps = {
  label: '',
  error: null,
  touched: false,
  disabled: false,
  className: '',
};

export default memo(CoverLetterDropdown);
