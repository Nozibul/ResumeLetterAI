/**
 * @file AuthService.js
 * @description Authentication business logic
 * @module modules/auth/services/AuthService
 */

const User = require('../models/User');
const { sendEmail } = require('../../../shared/utils/email');
const AppError = require('../../../shared/utils/AppError');
const { generateAccessToken, generateRefreshToken } = require('../../../shared/utils/tokenUtils');

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
      verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`,
    },
  }).catch((err) => console.error('Verification email failed:', err));

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Remove sensitive data
  user.password = undefined;

  return { user, accessToken, refreshToken };
};

/**
 * Login user
 */
exports.login = async (credentials, loginMetadata) => {
  const { email, password } = credentials;
  const { ip } = loginMetadata;

  // Find user with password field
  const user = await User.findByEmail(email).select(
    '+password +loginAttempts +lockUntil +firstFailedAt'
  );

  if (!user) {
    throw new AppError('Invalid email or password', 401);
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
    // Increment failed login attempts
    await user.incLoginAttempts();

    // Check if account is now locked
    const updatedUser = await User.findById(user._id).select('+lockUntil');
    if (updatedUser.isLocked) {
      throw new AppError('Too many failed attempts. Account locked for 15 minutes', 423);
    }

    throw new AppError('Invalid email or password', 401);
  }

  // Login successful - reset attempts and update activity
  await user.resetLoginAttempts();
  await user.updateLastActive();

  // Update login metadata
  user.lastLoginAt = new Date();
  user.lastLoginIP = ip;
  await user.save({ validateBeforeSave: false });

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Remove sensitive data
  user.password = undefined;
  user.loginAttempts = undefined;
  user.lockUntil = undefined;

  return { user, accessToken, refreshToken };
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

  // Generate new tokens (invalidate old ones)
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Remove sensitive data
  user.password = undefined;

  return { user, accessToken, refreshToken };
};

/**
 * Deactivate user account
 */
exports.deactivateAccount = async (userId, password) => {
  // Get user with password
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new AppError('Incorrect password', 401);
  }

  // Deactivate account
  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  return true;
};
