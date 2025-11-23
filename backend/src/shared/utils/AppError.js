/**
 * @file AppError.js
 * @description Custom error class for operational errors
 * @module utils/AppError
 * @author Nozibul Islam
 * @version 1.0.0
 */

class AppError extends Error {
  constructor(message, statusCode, data = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.data = data;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
