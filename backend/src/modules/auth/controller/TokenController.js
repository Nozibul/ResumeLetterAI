/**
 * @file TokenController.js
 * @description Token Management Controller (Email Verification, Password Reset, Token Refresh)
 * @module modules/auth/controllers/TokenController
 * @author Nozibul Islam
 * @version 1.0.0
 *
 * Responsibilities:
 * - Email verification
 * - Password reset (forgot/reset)
 * - Token refresh
 * - Resend verification email
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../../../utils/email');
const AppError = require('../../../utils/AppError');
const catchAsync = require('../../../utils/catchAsync');
const { sendTokenResponse, generateAccessToken } = require('../../../utils/tokenUtils');

// ==========================================
// EMAIL VERIFICATION
// ==========================================

/**
 * @desc    Verify email
 * @route   POST /api/v1/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  // Find user by verification token
  const user = await User.findByVerificationToken(token);

  if (!user) {
    return next(new AppError('Invalid or expired verification token', 400));
  }

  // Update user
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
});

/**
 * @desc    Resend verification email
 * @route   POST /api/v1/auth/resend-verification
 * @access  Private
 */
exports.resendVerificationEmail = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.isEmailVerified) {
    return next(new AppError('Email is already verified', 400));
  }

  // Generate new token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send email
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Email Verification - ResumeLetterAI',
      template: 'emailVerification',
      data: {
        fullName: user.fullName,
        verificationUrl,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email could not be sent. Please try again', 500));
  }
});

// ==========================================
// PASSWORD RESET
// ==========================================

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide email address', 400));
  }

  const user = await User.findByEmail(email);

  if (!user) {
    // Don't reveal if user exists
    return res.status(200).json({
      success: true,
      message: 'If email exists, password reset link has been sent',
    });
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send email
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - ResumeLetterAI',
      template: 'passwordReset',
      data: {
        fullName: user.fullName,
        resetUrl,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email could not be sent. Please try again', 500));
  }
});

/**
 * @desc    Reset password with token
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError('Please provide new password', 400));
  }

  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters', 400));
  }

  // Find user by reset token
  const user = await User.findByResetToken(token);

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Send confirmation email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Changed - ResumeLetterAI',
      template: 'passwordChanged',
      data: {
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error('Password change confirmation email failed:', error);
  }

  // Send new tokens
  sendTokenResponse(user, 200, res);
});

// ==========================================
// TOKEN REFRESH
// ==========================================

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public (requires refresh token)
 */
exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new AppError('No refresh token provided', 401));
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }

  // Find user
  const user = await User.findById(decoded.id).select('+passwordChangedAt');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Account is deactivated', 403));
  }

  // Check if password was changed after token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password recently changed. Please login again', 401));
  }

  // Update activity
  await user.updateLastActive();

  // Generate new access token
  const newAccessToken = generateAccessToken(user._id);

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.status(200).json({
    success: true,
    data: {
      accessToken: newAccessToken,
    },
  });
});

// ==========================================
// FILE 3: tokenUtils.js (Helper Functions)
// ==========================================

/**
 * @file tokenUtils.js
 * @description JWT Token utility functions
 * @module utils/tokenUtils
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
