/**
 * @file errorHandler.js
 * @author Nozibul Islam
 * @AIPromptUsed "Provide a comprehensive Express error handling middleware that handles common errors like Mongoose validation errors, JWT errors, and Multer file upload errors. The middleware should log errors appropriately using a logger utility and send standardized JSON responses to the client. Ensure that sensitive information is not exposed in production environments."
 */

const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, _) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errors = err.errors || null;

  // ==============================================
  // 1. Mongoose Validation Error
  // ==============================================
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // ==============================================
  // 2. Mongoose Cast Error (Invalid ObjectId)
  // ==============================================
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ==============================================
  // 3. Mongoose Duplicate Key Error
  // ==============================================
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // ==============================================
  // 4. JWT Errors
  // ==============================================
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please login again';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please login again';
  }

  // ==============================================
  // 5. Multer File Upload Errors
  // ==============================================
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    } else {
      message = 'File upload error';
    }
  }

  // ==============================================
  // Log Error
  // ==============================================
  if (statusCode >= 500) {
    // Server errors - full stack trace log করো
    logger.error('Server Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?.id
    });
  } else {
    // Client errors - simple log
    logger.warn('Client Error:', {
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      statusCode
    });
  }

  // ==============================================
  // Send Response
  // ==============================================
  const response = {
    success: false,
    message,
    ...(errors && { errors }), 
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack 
    })
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;