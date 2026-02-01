/**
 * @file errorHandler.js
 * @description Centralized error handling
 * @module shared/lib/api/errorHandler
 */

import logger from '../logger';

// ==========================================
// ERROR TYPES
// ==========================================

export const ERROR_TYPES = {
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SERVER: 'SERVER_ERROR',
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

// ==========================================
// ERROR MESSAGES (User-friendly)
// ==========================================

const ERROR_MESSAGES = {
  [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
  [ERROR_TYPES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_TYPES.UNAUTHORIZED]: 'You need to be logged in.',
  [ERROR_TYPES.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ERROR_TYPES.SERVER]: 'Something went wrong on our end. Please try again.',
  [ERROR_TYPES.NETWORK]: 'Network error. Please check your connection.',
  [ERROR_TYPES.TIMEOUT]: 'Request timed out. Please try again.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred.',
};

// ==========================================
// ERROR PARSER
// ==========================================

/**
 * Parse API error into standardized format
 * @param {Error} error - Axios error
 * @returns {Object} - { type, message, errors, statusCode }
 */
export const parseError = (error) => {
  // Network error (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return {
        type: ERROR_TYPES.TIMEOUT,
        message: ERROR_MESSAGES[ERROR_TYPES.TIMEOUT],
        statusCode: null,
        errors: null,
      };
    }

    return {
      type: ERROR_TYPES.NETWORK,
      message: ERROR_MESSAGES[ERROR_TYPES.NETWORK],
      statusCode: null,
      errors: null,
    };
  }

  const { status, data } = error.response;

  // Map status codes to error types
  let type;
  switch (status) {
    case 400:
      type = ERROR_TYPES.VALIDATION;
      break;
    case 401:
      type = ERROR_TYPES.UNAUTHORIZED;
      break;
    case 403:
      type = ERROR_TYPES.FORBIDDEN;
      break;
    case 404:
      type = ERROR_TYPES.NOT_FOUND;
      break;
    case 500:
    case 502:
    case 503:
      type = ERROR_TYPES.SERVER;
      break;
    default:
      type = ERROR_TYPES.UNKNOWN;
  }

  return {
    type,
    message: data?.message || ERROR_MESSAGES[type],
    statusCode: status,
    errors: data?.errors || null, // Field-level validation errors
  };
};

// ==========================================
// ERROR HANDLER
// ==========================================

/**
 * Handle error - parse + log
 * @param {Error} error
 * @returns {Object} - Parsed error
 */
export const handleError = (error) => {
  const parsedError = parseError(error);
  logger.error(parsedError.message, parsedError);
  return parsedError;
};
