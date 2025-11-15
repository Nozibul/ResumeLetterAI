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
// PUBLIC ROUTES (No authentication needed)
// ==========================================

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// ==========================================
// PRIVATE ROUTES (Authentication required)
// ==========================================

router.post('/logout', protect, requireEmailVerification, authController.logout);
router.get('/me', protect, requireEmailVerification, authController.getMe);
router.put(
  '/update-profile',
  protect,
  requireEmailVerification,
  validate(updateProfileSchema),
  authController.updateProfile
);
router.put(
  '/change-password',
  protect,
  requireEmailVerification,
  validate(changePasswordSchema),
  authController.changePassword
);

router.delete(
  '/delete-account',
  protect,
  requireEmailVerification,
  validate(deleteAccountSchema),
  authController.deleteAccount
);

module.exports = router;
