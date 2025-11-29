/**
 * @file TokenController.js
 * @description Token management controller (handles request/response only)
 * @module modules/auth/controllers/TokenController
 */

const tokenService = require('../services/TokenService');
const catchAsync = require('../../../shared/utils/catchAsync');

// ==========================================
// EMAIL VERIFICATION
// ==========================================

/**
 * @desc    Verify email
 * @route   POST /api/v1/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = catchAsync(async (req, res) => {
  await tokenService.verifyEmail(req.params.token);

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
exports.resendVerificationEmail = catchAsync(async (req, res) => {
  await tokenService.resendVerificationEmail(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Verification email sent',
  });
});

// ==========================================
// PASSWORD RESET
// ==========================================

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = catchAsync(async (req, res) => {
  await tokenService.forgotPassword(req.body.email);

  res.status(200).json({
    success: true,
    message: 'If email exists, password reset link has been sent',
  });
});

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = catchAsync(async (req, res) => {

  const { password, confirmPassword } = req.body;

  // Zod already validated, just pass both parameters
  const { user, accessToken, refreshToken } = await tokenService.resetPassword(
    req.params.token,
    password,
    confirmPassword 
  );

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
    data: { user, accessToken, refreshToken },
  });
});

// ==========================================
// TOKEN REFRESH
// ==========================================

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public (requires refresh token in cookie)
 */
exports.refreshToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  const newAccessToken = await tokenService.refreshAccessToken(refreshToken);

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    data: { accessToken: newAccessToken },
  });
});
