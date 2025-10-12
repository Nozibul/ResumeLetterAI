/**
 * @file AuthController.js
 * @description Authentication Controller (Register, Login, Profile Management)
 * @module modules/auth/controllers/AuthController
 * @author Nozibul Islam
 * @version 1.0.0
 *
 * Responsibilities:
 * - User registration
 * - User login/logout
 * - Profile management
 * - Password change
 * - Account deactivation
 */

const User = require('../models/User');
const { sendEmail } = require('../../../utils/email');
const { sendTokenResponse } = require('../../../utils/tokenUtils');
const AppError = require('../../../utils/AppError');
const catchAsync = require('../../../shared/utils/catchAsync');

// ==========================================
// AUTHENTICATION
// ==========================================

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = catchAsync(async (req, res, next) => {
  const { fullName, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return next(new AppError('Email already registered', 400));
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

  // Send verification email
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
  } catch (error) {
    console.error('Email sending failed:', error);
  }

  // Send token response
  sendTokenResponse(user, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Find user with password field
  const user = await User.findByEmail(email).select(
    '+password +loginAttempts +lockUntil +firstFailedAt'
  );

  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if account is locked
  if (user.isLocked) {
    const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return next(new AppError(`Account locked. Try again in ${lockTimeRemaining} minutes`, 423));
  }

  // Check if account is active
  if (!user.isActive) {
    return next(new AppError('Account is deactivated. Contact support', 403));
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    // Increment failed login attempts
    await user.incLoginAttempts();

    // Check if account is now locked
    const updatedUser = await User.findById(user._id).select('+lockUntil');
    if (updatedUser.isLocked) {
      return next(new AppError('Too many failed attempts. Account locked for 15 minutes', 423));
    }

    return next(new AppError('Invalid email or password', 401));
  }

  // Login successful - reset attempts and update activity
  await user.resetLoginAttempts();
  await user.updateLastActive();

  // Update login metadata
  user.lastLoginAt = new Date();
  user.lastLoginIP = req.ip || req.connection.remoteAddress;
  await user.save({ validateBeforeSave: false });

  // Send token response
  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
exports.logout = catchAsync(async (_, res) => {
  // Clear cookies
  res.cookie('accessToken', 'none', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });

  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// ==========================================
// PROFILE MANAGEMENT
// ==========================================

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Update activity
  await user.updateLastActive();

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/update-profile
 * @access  Private
 */
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { fullName, preferences } = req.body;

  const fieldsToUpdate = {};
  if (fullName) fieldsToUpdate.fullName = fullName;
  if (preferences) fieldsToUpdate.preferences = preferences;

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  await user.updateLastActive();

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check current password
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Validate new password
  if (newPassword.length < 8) {
    return next(new AppError('New password must be at least 8 characters', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  await user.updateLastActive();

  // Send new tokens (invalidate old ones)
  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Deactivate account (soft delete)
 * @route   DELETE /api/v1/auth/deactivate-account
 * @access  Private
 */
exports.deactivateAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(new AppError('Please provide password to confirm', 400));
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return next(new AppError('Incorrect password', 401));
  }

  // Deactivate account
  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  // Clear cookies
  res.cookie('accessToken', 'none', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });

  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully',
  });
});
