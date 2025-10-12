/**
 * @file tokenUtils.js
 * @description JWT Token utility functions
 * @module utils/tokenUtils
 * @author Nozibul Islam
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken');

/**
 * Generate JWT Access Token
 * @param {string} userId - User ID
 * @returns {string} - JWT token
 */
exports.generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
};

/**
 * Generate JWT Refresh Token
 * @param {string} userId - User ID
 * @returns {string} - JWT refresh token
 */
exports.generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

/**
 * Send tokens as HTTP-only cookies and JSON response
 * @param {Object} user - User document
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
exports.sendTokenResponse = (user, statusCode, res) => {
  const accessToken = this.generateAccessToken(user._id);
  const refreshToken = this.generateRefreshToken(user._id);

  // Cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  // Set cookies
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Remove sensitive data
  user.password = undefined;
  user.loginAttempts = undefined;
  user.lockUntil = undefined;

  res.status(statusCode).json({
    success: true,
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
};
