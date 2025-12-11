/**
 * @file AuthService.js
 * @description Authentication business logic (Multi-session support added)
 * @module modules/auth/services/AuthService
 */

const User = require('../models/User');
const UserSession = require('../models/UserSession');
const { sendEmail } = require('../../../shared/utils/email');
const AppError = require('../../../shared/utils/AppError');
const { generateAccessToken, generateRefreshToken } = require('../../../shared/utils/tokenUtils');

// Feature flag from environment
const MULTI_SESSION_ENABLED = process.env.ENABLE_MULTI_SESSION === 'true';

// ==========================================
// AUTHENTICATION
// ==========================================

/**
 * Register new user
 */
exports.register = async (userData) => {
  const { fullName, email, password } = userData;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  // Create user
  const user = await User.create({
    fullName,
    email,
    password,
    lastActiveAt: new Date(),
  });

  // Generate email verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email (non-blocking)
  sendEmail({
    to: user.email,
    subject: 'Email Verification - ResumeLetterAI',
    template: 'emailVerification',
    data: {
      fullName: user.fullName,
      verificationUrl: `${process.env.BACKEND_URL}/api/v1/token/verify-email/${verificationToken}`,
    },
  }).catch((err) => console.error('Verification email failed:', err));

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // 🆕 Multi-session support: Create session record
  if (MULTI_SESSION_ENABLED) {
    await UserSession.createSession(user._id, refreshToken, {}, null);
  }

  // Remove sensitive data
  user.password = undefined;

  return { user, accessToken, refreshToken };
};

/**
 * Login user
 */
exports.login = async (credentials, loginMetadata) => {
  const { email, password } = credentials;
  const { ip, userAgent } = loginMetadata;

  // Find user with password field
  const user = await User.findByEmail(email).select(
    '+password +loginAttempts +lockUntil +firstFailedAt'
  );

  if (!user) {
    throw new AppError('Invalid email or password', 400);
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new AppError('Please verify your email before logging in', 403);
  }

  // Check if account is locked
  if (user.isLocked) {
    const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw new AppError(`Account locked. Try again in ${lockTimeRemaining} minutes`, 423);
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AppError('Account is deactivated. Contact support', 403);
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    // Get result object from incLoginAttempts
    const result = await user.incLoginAttempts();

    // Check if account is now locked
    if (result.locked) {
      throw new AppError('Too many failed attempts. Account locked for 2 minutes', 423, {
        lockUntil: result.lockUntil,
      });
    }

    throw new AppError('Invalid email or password', 400); 
  }

  // Login successful - update everything in one save
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.firstFailedAt = undefined;
  user.lastActiveAt = new Date();
  user.lastLoginAt = new Date();
  user.lastLoginIP = ip;
  await user.save({ validateBeforeSave: false });

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Multi-session support: Create session record
  if (MULTI_SESSION_ENABLED) {
    const deviceInfo = parseUserAgent(userAgent);
    await UserSession.createSession(user._id, refreshToken, deviceInfo, ip);
  }

  // Remove sensitive data
  user.password = undefined;
  user.loginAttempts = undefined;
  user.lockUntil = undefined;

  return { user, accessToken, refreshToken };
};

// ==========================================
// MULTI-SESSION MANAGEMENT
// ==========================================

/**
 * Get user's active sessions
 */
exports.getUserSessions = async (userId) => {
  if (!MULTI_SESSION_ENABLED) {
    throw new AppError('Multi-session feature is not enabled', 400);
  }

  return UserSession.getUserSessions(userId);
};

/**
 * Revoke specific session (logout from one device)
 */
exports.revokeSession = async (userId, sessionId) => {
  if (!MULTI_SESSION_ENABLED) {
    throw new AppError('Multi-session feature is not enabled', 400);
  }

  const session = await UserSession.findById(sessionId);

  if (!session || session.userId.toString() !== userId.toString()) {
    throw new AppError('Session not found', 404);
  }

  await UserSession.revokeSession(sessionId);
  return true;
};

/**
 * Revoke all sessions except current (logout from all other devices)
 */
exports.revokeOtherSessions = async (userId, currentRefreshToken) => {
  if (!MULTI_SESSION_ENABLED) {
    throw new AppError('Multi-session feature is not enabled', 400);
  }

  const sessions = await UserSession.find({
    userId,
    isActive: true,
    refreshToken: { $ne: currentRefreshToken },
  });

  await Promise.all(sessions.map((session) => UserSession.revokeSession(session._id)));

  return sessions.length;
};

// ==========================================
// PROFILE MANAGEMENT
// ==========================================

/**
 * Get user profile
 */
exports.getProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update activity
  await user.updateLastActive();

  return user;
};

/**
 * Update user profile
 */
exports.updateProfile = async (userId, updateData) => {
  const { fullName, preferences } = updateData;

  const fieldsToUpdate = {};
  if (fullName) fieldsToUpdate.fullName = fullName;
  if (preferences) fieldsToUpdate.preferences = preferences;

  const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  await user.updateLastActive();

  return user;
};

/**
 * Change user password
 */
exports.changePassword = async (userId, passwordData) => {
  const { currentPassword, newPassword } = passwordData;

  // Get user with password
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check current password
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  await user.updateLastActive();

  // Revoke all sessions on password change (security best practice)
  if (MULTI_SESSION_ENABLED) {
    await UserSession.revokeAllUserSessions(userId);
  }

  // Generate new tokens (invalidate old ones)
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Create new session for current device
  if (MULTI_SESSION_ENABLED) {
    await UserSession.createSession(userId, refreshToken, {}, null);
  }

  // Remove sensitive data
  user.password = undefined;

  return { user, accessToken, refreshToken };
};

/**
 * Deleted user account
 */
exports.deleteAccount = async (userId, password) => {
  // Get user with password
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new AppError('Incorrect password', 400);
  }

  // Revoke all sessions before account deletion
  if (MULTI_SESSION_ENABLED) {
    await UserSession.revokeAllUserSessions(userId);
  }

  // Hard delete
  await User.findByIdAndDelete(userId);

  return true;
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Parse user agent string (simple implementation)
 */
function parseUserAgent(userAgent) {
  if (!userAgent) return {};

  const ua = userAgent.toLowerCase();

  return {
    userAgent,
    browser: getBrowser(ua),
    os: getOS(ua),
    device: getDevice(ua),
  };
}

function getBrowser(ua) {
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';
  return 'Unknown';
}

function getOS(ua) {
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac')) return 'MacOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('ios') || ua.includes('iphone')) return 'iOS';
  return 'Unknown';
}

function getDevice(ua) {
  if (ua.includes('mobile')) return 'Mobile';
  if (ua.includes('tablet')) return 'Tablet';
  return 'Desktop';
}
