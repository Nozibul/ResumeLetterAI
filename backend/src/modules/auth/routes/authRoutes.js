/**
 * @file authRoutes.js
 * @description Authentication routes
 * @module modules/auth/routes/authRoutes
 */

const express = require('express');
const router = express.Router();

// Middleware
const { protect } = require('../middlewares/authMiddleware');
const { validate } = require('../../../middleware/validate');

// Validation schemas
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  deactivateAccountSchema,
} = require('../validations/authValidation');

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

router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.put('/update-profile', protect, validate(updateProfileSchema), authController.updateProfile);
router.put(
  '/change-password',
  protect,
  validate(changePasswordSchema),
  authController.changePassword
);

router.delete(
  '/deactivate-account',
  protect,
  validate(deactivateAccountSchema),
  authController.deactivateAccount
);

module.exports = router;
