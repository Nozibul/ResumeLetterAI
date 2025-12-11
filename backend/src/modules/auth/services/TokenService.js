/**
 * @file TokenService.js
 * @description Token management business logic (Multi-session support added)
 * @module modules/auth/services/TokenService
 */

const User = require('../models/User');
const UserSession = require('../models/UserSession'); 
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../../../shared/utils/email');
const AppError = require('../../../shared/utils/AppError');
const { generateAccessToken, generateRefreshToken } = require('../../../shared/utils/tokenUtils');

// 🆕 Feature flag from environment
const MULTI_SESSION_ENABLED = process.env.ENABLE_MULTI_SESSION === 'true';

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

// Service function
/**
 * Send password reset email with rate limiting
 */
exports.forgotPassword = async (email) => {
  // 1. Validate email
  if (!email || !email.trim()) {
    throw new AppError('Email is required', 400);
  }

  // 2. Find user by email
  const user = await User.findByEmail(email).select('+passwordResetExpires');

  // Security: Don't reveal if user exists or not
  if (!user) {
    return {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    };
  }

  // 3. Check if user account is active
  if (!user.isActive) {
    throw new AppError('This account has been deleted. Please Sign Up Again.', 403);
  }

  // 4. RATE LIMITING: Check if user already has a valid token
  if (user.passwordResetExpires && user.passwordResetExpires > Date.now()) {
    const minutesLeft = Math.ceil((user.passwordResetExpires - Date.now()) / 60000);
    throw new AppError(
      `Password reset link already sent. Please check your email or wait ${minutesLeft} minute(s) before requesting again.`,
      429
    );
  }

  // 5. Generate reset token
  const resetToken = user.createPasswordResetToken();

  if (!resetToken) {
    throw new AppError('Failed to generate reset token', 500);
  }

  // 6. Save token to database
  await user.save({ validateBeforeSave: false });

  // 7. Send email
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    if (!process.env.FRONTEND_URL) {
      throw new AppError('FRONTEND_URL is not configured', 500);
    }

    await sendEmail({
      to: user.email,
      subject: 'Password Reset - ResumeLetterAI',
      template: 'passwordReset',
      data: {
        fullName: user.fullName,
        resetUrl,
        expiresIn: '10 minutes',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@resumeletterai.com',
      },
    });

    return {
      success: true,
      message: 'Password reset link has been sent to your email address.',
    };
  } catch (error) {
    // Rollback: Remove token from database
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('Password reset email error:', error);
    throw new AppError('Failed to send password reset email. Please try again later.', 500);
  }
};

/**
 * Reset password with token
 */
/**
 * Reset password with token (with enhanced security)
 */
exports.resetPassword = async (token, newPassword, confirmPassword) => {
  // 1. Validate inputs
  if (!token || !token.trim()) {
    throw new AppError('Reset token is required', 400);
  }

  if (!newPassword || newPassword.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  if (newPassword !== confirmPassword) {
    throw new AppError('Passwords do not match', 400);
  }

  // 2. Find user with valid token
  const user = await User.findByResetToken(token).select('+password');

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  if (!user.isActive) {
    throw new AppError('This account has been deactivated', 403);
  }

  // 3. Update password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();

  // 4. Reset login attempts if any
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.firstFailedAt = undefined;

  await user.save();

  // 5. Revoke all sessions (security best practice)
  if (MULTI_SESSION_ENABLED) {
    await UserSession.revokeAllUserSessions(user._id);
  }

  // 6. Send confirmation email (non-blocking)
  sendEmail({
    to: user.email,
    subject: 'Password Changed - ResumeLetterAI',
    template: 'passwordChanged',
    data: {
      fullName: user.fullName,
      changedAt: new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Dhaka',
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    },
  }).catch((err) => console.error('Password change email failed:', err));

  // 7. Generate new tokens for current session
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // 8. Create new session
  if (MULTI_SESSION_ENABLED) {
    await UserSession.createSession(user._id, refreshToken, {}, null);
  }

  // Clean up sensitive data before returning
  user.password = undefined;
  user.loginAttempts = undefined;
  user.lockUntil = undefined;

  return {
    success: true,
    message: 'Password has been reset successfully',
    user,
    accessToken,
    refreshToken,
  };
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

  // 🆕 Multi-session: Validate session if enabled
  if (MULTI_SESSION_ENABLED) {
    const session = await UserSession.findByToken(refreshToken);

    if (!session) {
      throw new AppError('Session not found or expired', 401);
    }

    if (!session.isValid()) {
      throw new AppError('Session has been revoked', 401);
    }

    // Update session last used time
    await UserSession.updateLastUsed(refreshToken);
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

// ==========================================
// 🆕 LOGOUT (Session Management)
// ==========================================

/**
 * Logout user (revoke session if multi-session enabled)
 */
exports.logout = async (refreshToken) => {
  if (!MULTI_SESSION_ENABLED) {
    // Without multi-session: Just client-side token removal
    return { message: 'Logged out successfully' };
  }

  // With multi-session: Revoke the session
  const session = await UserSession.findByToken(refreshToken);

  if (session) {
    await UserSession.revokeSession(session._id);
  }

  return { message: 'Logged out successfully' };
};
