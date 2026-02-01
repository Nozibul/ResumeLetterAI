// utils/colorUtils.js

const COLORS = [
  'blue',
  'red',
  'green',
  'orange',
  'purple',
  'teal',
  'amber',
  'pink',
  'indigo',
  'cyan',
];

export const getColorGradient = (index) => {
  const colors = {
    blue: 'from-blue-300 to-blue-500',
    red: 'from-red-300 to-red-500',
    green: 'from-green-300 to-green-500',
    orange: 'from-orange-300 to-orange-700',
    purple: 'from-purple-300 to-purple-500',
    teal: 'from-teal-300 to-teal-500',
    amber: 'from-amber-300 to-amber-500',
    pink: 'from-pink-300 to-pink-500',
    indigo: 'from-indigo-300 to-indigo-500',
    cyan: 'from-cyan-300 to-cyan-500',
  };

  const colorName = COLORS[index % COLORS.length];
  return colors[colorName];
};

export const getBorderColor = (index) => {
  const colors = {
    blue: 'border-blue-300',
    red: 'border-red-300',
    green: 'border-green-300',
    orange: 'border-orange-300',
    purple: 'border-purple-300',
    teal: 'border-teal-300',
    amber: 'border-amber-300',
    pink: 'border-pink-300',
    indigo: 'border-indigo-300',
    cyan: 'border-cyan-300',
  };

  const colorName = COLORS[index % COLORS.length];
  return colors[colorName];
};

// ==========================================
// RESUME / ATS COLOR UTILITIES
// ==========================================

import { ATS_SAFE_COLORS } from './constants';

/**
 * Validate hex color format
 * @param {string} color
 * @returns {boolean}
 */
export const isValidHexColor = (color) => {
  if (!color) return false;
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

/**
 * Check if color is ATS-safe
 * @param {string} color - hex color
 * @returns {boolean}
 */
export const isATSSafeColor = (color) => {
  return ATS_SAFE_COLORS.some((c) => c.value === color);
};

/**
 * Hex to RGB
 * @param {string} hex - "#000000"
 * @returns {Object} - { r, g, b }
 */
export const hexToRgb = (hex) => {
  if (!isValidHexColor(hex)) return { r: 0, g: 0, b: 0 };

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

/**
 * Get contrasting text color (black or white) for background
 * @param {string} bgHex - background hex color
 * @returns {string} - "#000000" or "#FFFFFF"
 */
export const getContrastColor = (bgHex) => {
  const { r, g, b } = hexToRgb(bgHex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Get color scheme based on template category
 * IT/ATS = locked black, others = customizable
 * @param {string} category - template category
 * @param {string} userColor - user selected color
 * @returns {Object} - { primary, isLocked }
 */
export const getColorScheme = (category, userColor = '#000000') => {
  const isATS = category === 'ats-friendly' || category === 'it';

  return {
    primary: isATS ? '#000000' : userColor,
    isLocked: isATS,
  };
};
