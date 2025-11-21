/**
 * @file authRoutes.js
 * @description Authentication routes
 * @module modules/auth/routes/authRoutes
 */

const express = require('express');
const router = express.Router();

// Middleware
const { protect, requireEmailVerification } = require('../middlewares/authMiddleware');
const { validate } = require('../../../modules/middleware/validate');

// Validation schemas
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} = require('../validation/authValidation');

// Controller
const authController = require('../controller/AuthController');

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * POST /api/v1/auth/register
 * @description Register a new user
 * @body {string} email, {string} password, {string} name
 * @returns {object} user, token
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * POST /api/v1/auth/login
 * @description Login user
 * @body {string} email, {string} password
 * @returns {object} user, token
 */
router.post('/login', validate(loginSchema), authController.login);

// ==========================================
// PROTECTED ROUTES
// ==========================================

/**
 * POST /api/v1/auth/logout
 * @description Logout user
 * @auth required
 */
router.post('/logout', protect, requireEmailVerification, authController.logout);

/**
 * GET /api/v1/auth/me
 * @description Get current user profile
 * @auth required
 * @returns {object} user
 */
router.get('/me', protect, requireEmailVerification, authController.getMe);

/**
 * PUT /api/v1/auth/update-profile
 * @description Update user profile
 * @auth required
 * @body {string} name, {string} bio, {string} profilePicture
 */
router.put(
  '/update-profile',
  protect,
  requireEmailVerification,
  validate(updateProfileSchema),
  authController.updateProfile
);

/**
 * PUT /api/v1/auth/change-password
 * @description Change user password
 * @auth required
 * @body {string} currentPassword, {string} newPassword
 */
router.put(
  '/change-password',
  protect,
  requireEmailVerification,
  validate(changePasswordSchema),
  authController.changePassword
);

/**
 * DELETE /api/v1/auth/delete-account
 * @description Delete user account permanently
 * @auth required
 * @body {string} password
 */
router.delete(
  '/delete-account',
  protect,
  requireEmailVerification,
  validate(deleteAccountSchema),
  authController.deleteAccount
);

module.exports = router;
