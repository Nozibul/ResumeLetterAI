/**
 * @file dateUtils.js
 * @description Date utility functions — shared with frontend logic
 * @module shared/utils/dateUtils
 * @author Nozibul Islam
 */

'use strict';

const MONTHS = [
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

/**
 * Format date to readable string.
 * Handles { month, year } objects, Date objects, and strings.
 *
 * @param {Date|Object|string|null} date
 * @returns {string} e.g. "Jan 2024" or "Present"
 *
 * formatDate(null)                   → "Present"
 * formatDate({ month: 1, year: 2024 }) → "Jan 2024"
 * formatDate("2024-01-15")           → "Jan 2024"
 */
exports.formatDate = (date) => {
  if (!date) return 'Present';

  try {
    // Handle { month, year } object (from resume forms)
    if (
      typeof date === 'object' &&
      date.month !== undefined &&
      date.year !== undefined
    ) {
      const monthIndex = parseInt(date.month, 10) - 1; // month is 1-12
      const monthName = MONTHS[monthIndex] || 'Jan';
      return `${monthName} ${date.year}`;
    }

    // Handle Date object or string
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    return `${MONTHS[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  } catch (error) {
    return 'Invalid Date';
  }
};
