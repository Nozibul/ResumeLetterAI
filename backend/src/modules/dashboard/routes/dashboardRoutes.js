/**
 * @file dashboardRoutes.js
 * @description Dashboard routes - protected routes for authenticated users
 * @module modules/dashboard/routes/dashboardRoutes
 * @author Nozibul Islam
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();

// Middleware
const { protect, requireEmailVerification } = require('../../auth/middlewares/authMiddleware');

// Controller
const dashboardController = require('../controllers/dashboardController');

/**
 * @route   GET /api/v1/dashboard
 * @desc    Access dashboard (protected)
 * @access  Private
 * @middleware protect - Verify JWT token
 * @middleware requireEmailVerification - Ensure email is verified
 */
router.get('/', protect, requireEmailVerification, dashboardController.getDashboard);

module.exports = router;