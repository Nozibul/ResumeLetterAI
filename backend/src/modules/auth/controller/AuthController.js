/**
 * @file AuthController.js
 * @description Authentication controller (handles request/response only)
 * @module modules/auth/controllers/AuthController
 */

const catchAsync = require('../../../shared/utils/catchAsync');
const authService = require('../services/AuthService');

// ==========================================
// AUTHENTICATION
// ==========================================

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  // Set HTTP-only cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email',
    data: { user, accessToken, refreshToken },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body, {
    ip: req.ip || req.connection.remoteAddress,
  });

  // Set HTTP-only cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, accessToken, refreshToken },
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
exports.logout = catchAsync(async (req, res) => {
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
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user.id);

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
exports.updateProfile = catchAsync(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
exports.changePassword = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.changePassword(
    req.user.id,
    req.body
  );

  // Set new cookies (invalidate old tokens)
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data: { user, accessToken, refreshToken },
  });
});

/**
 * @desc    Deactivate account
 * @route   DELETE /api/v1/auth/deactivate-account
 * @access  Private
 */
exports.deactivateAccount = catchAsync(async (req, res) => {
  await authService.deactivateAccount(req.user.id, req.body.password);

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
