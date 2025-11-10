/**
 * @file authRoutes.js
 */
const express = require('express');
const AuthController = require('../controllers/AuthController');
// const TokenController = require('../controllers/TokenController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Auth Routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// // Token Routes (Public)
// router.post('/verify-email/:token', TokenController.verifyEmail);
// router.post('/forgot-password', TokenController.forgotPassword);
// router.post('/reset-password/:token', TokenController.resetPassword);
// router.post('/refresh-token', TokenController.refreshToken);

// Protected Routes
router.use(protect);

router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getMe);
router.put('/update-profile', AuthController.updateProfile);
router.put('/change-password', AuthController.changePassword);
// router.post('/resend-verification', TokenController.resendVerificationEmail);
router.delete('/deactivate-account', AuthController.deactivateAccount);

module.exports = router;
