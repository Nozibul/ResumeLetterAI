/**
 * @file tokenRoutes.js
 * @description Token management routes
 * @module modules/auth/routes/tokenRoutes
 */

const express = require('express');
const router = express.Router();

// Middleware
const { protect } = require('../middlewares/authMiddleware');
const { validate } = require('../../../modules/middleware/validate');

// Validation schemas
const {
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validation/tokenValidation');

// Controller
const tokenController = require('../controller/TokenController');

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * GET /api/auth/verify-email/:token
 * @description Verify user email with token
 * @param {string} token - Verification token from email
 * @returns {object} Success message
 */
router.get('/verify-email/:token', validate(verifyEmailSchema), tokenController.verifyEmail);

/**
 * POST /api/auth/forgot-password
 * @description Send password reset email
 * @body {string} email
 * @returns {object} Success message
 */
router.post('/forgot-password', validate(forgotPasswordSchema), tokenController.forgotPassword);

/**
 * POST /api/auth/reset-password/:token
 * @description Reset password with token
 * @param {string} token - Reset token from email
 * @body {string} newPassword
 * @returns {object} Success message
 */
router.post('/reset-password/:token', validate(resetPasswordSchema), tokenController.resetPassword);

/**
 * POST /api/auth/refresh-token
 * @description Get new access token using refresh token
 * @cookie {string} refreshToken - Refresh token (if using cookies)
 * @body {string} refreshToken - Refresh token (if using body)
 * @returns {object} New access token
 */
router.post('/refresh-token', tokenController.refreshToken);

// ==========================================
// PROTECTED ROUTES
// ==========================================

/**
 * POST /api/auth/resend-verification
 * @description Resend email verification link
 * @auth required
 * @returns {object} Success message
 */
router.post('/resend-verification', protect, tokenController.resendVerificationEmail);

module.exports = router;
