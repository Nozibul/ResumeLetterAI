/**
 * @file shared/components/atoms/resume/TagInput.jsx
 * @description Tag input with autocomplete for skills/technologies
 * @author Nozibul Islam
 *
 * Features:
 * - Add tags by pressing Enter
 * - Remove tags with X button
 * - Autocomplete suggestions
 * - Max tags limit
 * - Duplicate prevention
 *
 */

'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * TagInput Component
 */
function TagInput({
  label,
  name,
  tags,
  onAdd,
  onRemove,
  suggestions,
  maxTags,
  placeholder,
  required,
  className,
}) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter suggestions
  const filteredSuggestions = useMemo(() => {
    if (!suggestions || !inputValue) return [];

    return suggestions
      .filter(
        (item) =>
          item.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(item)
      )
      .slice(0, 10); // Max 10 suggestions
  }, [suggestions, inputValue, tags]);

  // Handle add tag
  const handleAddTag = useCallback(() => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) return;

    // Check max limit
    if (maxTags && tags.length >= maxTags) {
      alert(`Maximum ${maxTags} tags allowed`);
      return;
    }

    // Check duplicate
    if (tags.includes(trimmedValue)) {
      setInputValue('');
      return;
    }

    onAdd(trimmedValue);
    setInputValue('');
    setShowSuggestions(false);
  }, [inputValue, tags, maxTags, onAdd]);

  // Handle key down
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      }
    },
    [handleAddTag]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion) => {
      if (maxTags && tags.length >= maxTags) {
        alert(`Maximum ${maxTags} tags allowed`);
        return;
      }

      onAdd(suggestion);
      setInputValue('');
      setShowSuggestions(false);
    },
    [tags, maxTags, onAdd]
  );

  const inputId = `tag-input-${name}`;

  return (
    <div className={className}>
      {/* Label */}
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {maxTags && (
          <span className="text-gray-400 text-xs ml-2">
            ({tags.length}/{maxTags})
          </span>
        )}
      </label>

      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="hover:text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
                aria-label={`Remove ${tag}`}
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input with Suggestions */}
      <div className="relative">
        <input
          id={inputId}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          disabled={maxTags && tags.length >= maxTags}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-teal-50 text-sm focus:outline-none focus:bg-teal-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <p className="mt-1 text-xs text-gray-500">Type and press Enter to add</p>
    </div>
  );
}

TagInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.string),
  maxTags: PropTypes.number,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};

TagInput.defaultProps = {
  suggestions: [],
  maxTags: null,
  placeholder: '',
  required: false,
  className: '',
};

export default memo(TagInput);
