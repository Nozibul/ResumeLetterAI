// src/lib/utils.js
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

/**
 * @file utils.js
 * @description General utility functions
 * @module shared/lib/utils
 */

// ==========================================
// STRING UTILITIES
// ==========================================

/**
 * Truncate string with ellipsis
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (str, maxLength = 50) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
};

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format name based on case type
 * @param {string} name
 * @param {string} caseType - 'uppercase' | 'capitalize' | 'normal'
 * @returns {string}
 */
export const formatName = (name, caseType = 'uppercase') => {
  if (!name) return '';

  switch (caseType) {
    case 'uppercase':
      return name.toUpperCase();
    case 'capitalize':
      return name
        .split(' ')
        .map((word) => capitalize(word))
        .join(' ');
    case 'normal':
      return name;
    default:
      return name;
  }
};

// ==========================================
// DATE UTILITIES
// ==========================================

/**
 * Format {month, year} to display string
 * @param {Object} date - { month: Number, year: Number }
 * @returns {string} - "Jan 2023"
 */
export const formatDate = (date) => {
  if (!date?.month || !date?.year) return '';

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return `${months[date.month - 1]} ${date.year}`;
};

/**
 * Compare two {month, year} dates
 * @param {Object} date1
 * @param {Object} date2
 * @returns {number} - negative if date1 < date2, 0 if equal, positive if date1 > date2
 */
export const compareDates = (date1, date2) => {
  if (!date1 || !date2) return 0;
  const val1 = date1.year * 12 + date1.month;
  const val2 = date2.year * 12 + date2.month;
  return val1 - val2;
};

/**
 * Get current month and year
 * @returns {Object} - { month: Number, year: Number }
 */
export const getCurrentDate = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

// ==========================================
// ARRAY UTILITIES
// ==========================================

/**
 * Reorder array item (drag-drop)
 * @param {Array} list
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {Array}
 */
export const reorderArray = (list, fromIndex, toIndex) => {
  const result = [...list];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};

/**
 * Remove item from array by index
 * @param {Array} list
 * @param {number} index
 * @returns {Array}
 */
export const removeByIndex = (list, index) => {
  return list.filter((_, i) => i !== index);
};

// ==========================================
// OBJECT UTILITIES
// ==========================================

/**
 * Deep clone object
 * @param {Object} obj
 * @returns {Object}
 */
export const deepClone = (obj) => {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {Object} obj
 * @returns {boolean}
 */
export const isEmptyObject = (obj) => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

// ==========================================
// DEBOUNCE
// ==========================================

/**
 * Debounce function
 * @param {Function} func
 * @param {number} wait - milliseconds
 * @returns {Function}
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
