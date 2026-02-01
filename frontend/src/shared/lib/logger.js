/**
 * @file logger.js
 * @description Centralized logging utility
 * @module shared/lib/logger
 */

const isDev = process.env.NODE_ENV === 'development';

const logger = {
  /**
   * Info log - General information
   */
  info: (...args) => {
    if (isDev) console.log('ℹ️ ', ...args);
  },

  /**
   * Success log - Successful operations
   */
  success: (...args) => {
    if (isDev) console.log('✅', ...args);
  },

  /**
   * Warning log - Potential issues
   */
  warn: (...args) => {
    if (isDev) console.warn('⚠️ ', ...args);
  },

  /**
   * Error log - Always logs (dev + prod)
   */
  error: (...args) => {
    console.error('❌', ...args);
  },

  /**
   * API log - API request/response tracking
   */
  api: (method, url, status) => {
    if (!isDev) return;

    const colors = {
      GET: '\x1b[36m', // Cyan
      POST: '\x1b[32m', // Green
      PATCH: '\x1b[33m', // Yellow
      PUT: '\x1b[33m', // Yellow
      DELETE: '\x1b[31m', // Red
    };

    const statusColor = status >= 400 ? '\x1b[31m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(
      `${colors[method] || ''}${method}${reset} ${url} ${statusColor}${status}${reset}`
    );
  },
};

export default logger;
