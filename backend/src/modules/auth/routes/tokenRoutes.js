/**
 * @file tokenRoutes.js
 * @description Token management routes
 * @module modules/auth/routes/tokenRoutes
 */

const express = require('express');
const router = express.Router();

// Middleware
const { protect } = require('../middlewares/authMiddleware');
const { validate } = require('../../../middleware/validate');

// Validation schemas
const {
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validations/tokenValidation');

// Controller
const tokenController = require('../controllers/TokenController');

// PUBLIC ROUTES (No authentication needed)
router.post('/verify-email/:token', validate(verifyEmailSchema), tokenController.verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), tokenController.forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), tokenController.resetPassword);
router.post('/refresh-token', tokenController.refreshToken);

// PRIVATE ROUTES (Authentication required)
router.post('/resend-verification', protect, tokenController.resendVerificationEmail);

module.exports = router;
