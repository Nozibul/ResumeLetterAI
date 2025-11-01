/**
 * @file notFoundHandle.js
 * @author Nozibul Islams
 */

const { logger } = require('../utils/logger');

const notFoundHandler = (req, _, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.isOperational = true;

  logger.warn('404 Not Found:', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Pass to error handler
  next(error);
};

module.exports = { notFoundHandler };
