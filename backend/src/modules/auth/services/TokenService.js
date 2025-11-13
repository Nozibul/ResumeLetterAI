/**
 * @file TokenService.js
 * @description Token management business logic
 * @module modules/auth/services/TokenService
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../../../shared/utils/email');
const AppError = require('../../../shared/utils/AppError');
const { generateAccessToken, generateRefreshToken } = require('../../../shared/utils/tokenUtils');

// ==========================================
// EMAIL VERIFICATION
// ==========================================

/**
 * Verify user email with token
 */
exports.verifyEmail = async (token) => {
  const user = await User.findByVerificationToken(token);

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });
};

/**
 * Resend verification email
 */
exports.resendVerificationEmail = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isEmailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Email Verification - ResumeLetterAI',
      template: 'emailVerification',
      data: {
        fullName: user.fullName,
        verificationUrl,
      },
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Email could not be sent. Please try again', 500);
  }
};

// ==========================================
// PASSWORD RESET
// ==========================================

/**
 * Send password reset email
 */
exports.forgotPassword = async (email) => {
  const user = await User.findByEmail(email);

  if (!user) {
    return; // Don't reveal user existence
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

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
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Email could not be sent. Please try again', 500);
  }
};

/**
 * Reset password with token
 */
exports.resetPassword = async (token, newPassword) => {
  const user = await User.findByResetToken(token);

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Send confirmation email (non-blocking)
  sendEmail({
    to: user.email,
    subject: 'Password Changed - ResumeLetterAI',
    template: 'passwordChanged',
    data: { fullName: user.fullName },
  }).catch((err) => console.error('Password change email failed:', err));

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.password = undefined;
  user.loginAttempts = undefined;
  user.lockUntil = undefined;

  return { user, accessToken, refreshToken };
};

// ==========================================
// TOKEN REFRESH
// ==========================================

/**
 * Refresh access token
 */
exports.refreshAccessToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.id).select('+passwordChangedAt');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    throw new AppError('Password recently changed. Please login again', 401);
  }

  await user.updateLastActive();

  return generateAccessToken(user._id);
};
