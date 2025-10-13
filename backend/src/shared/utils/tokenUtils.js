/**
 * @file tokenUtils.js
 * @description JWT Token utility functions
 * @module utils/tokenUtils
 * @author Nozibul Islam
 * @version 2.0.0
 *
 * Security Features:
 * - Minimal JWT payload
 * - HTTP-only cookies only
 * - No sensitive data in response
 * - Proper error handling
 * - Environment validation
 */

const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

exports.generateAccessToken = (userId) => {
  if (!userId) {
    throw new AppError('User ID is required', 400);
  }

  if (!process.env.JWT_ACCESS_SECRET) {
    throw new AppError('JWT_ACCESS_SECRET not configured', 500);
  }

  try {
    return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      issuer: process.env.JWT_ISSUER || 'resumeletterai',
      audience: process.env.JWT_AUDIENCE || 'resumeletterai-users',
    });
  } catch (error) {
    throw new AppError('Failed to generate access token', 500);
  }
};

exports.generateRefreshToken = (userId) => {
  if (!userId) {
    throw new AppError('User ID is required', 400);
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    throw new AppError('JWT_REFRESH_SECRET not configured', 500);
  }

  try {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: process.env.JWT_ISSUER || 'resumeletterai',
      audience: process.env.JWT_AUDIENCE || 'resumeletterai-users',
    });
  } catch (error) {
    throw new AppError('Failed to generate refresh token', 500);
  }
};

exports.sendTokenResponse = (user, statusCode, res) => {
  // Validation
  if (!user || !user._id) {
    throw new AppError('Invalid user data', 400);
  }

  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new AppError('Token secrets not configured', 500);
  }

  try {
    // Generate tokens
    const accessToken = exports.generateAccessToken(user._id);
    const refreshToken = exports.generateRefreshToken(user._id);

    // Cookie options with security headers
    const cookieOptions = {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      path: '/', // Available across all routes
    };

    // Set access token cookie (short-lived: 15 minutes)
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    });

    // Set refresh token cookie (long-lived: 7 days)
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // Remove all sensitive fields from user object
    // These should NEVER be sent to client
    user.password = undefined;
    user.loginAttempts = undefined;
    user.lockUntil = undefined;
    user.firstFailedAt = undefined;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = undefined;

    // Send response (tokens only in cookies, not in body)
    res.status(statusCode).json({
      success: true,
      message: statusCode === 201 ? 'Registration successful' : 'Login successful',
      data: {
        user, // Only public user data
        // Tokens are NOT included here (security best practice)
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to send token response', 500);
  }
};

exports.verifyToken = (token, secret) => {
  if (!token) {
    throw new AppError('No token provided', 401);
  }

  if (!secret) {
    throw new AppError('Secret not configured', 500);
  }

  try {
    return jwt.verify(token, secret, {
      issuer: process.env.JWT_ISSUER || 'resumeletterai',
      audience: process.env.JWT_AUDIENCE || 'resumeletterai-users',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired', 401);
    } else if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401);
    }
    throw new AppError('Token verification failed', 401);
  }
};
