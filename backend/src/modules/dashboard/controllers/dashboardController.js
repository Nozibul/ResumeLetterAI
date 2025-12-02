/**
 * @file dashboardController.js
 * @description Dashboard controller - handles protected dashboard access
 * @module modules/dashboard/controllers/dashboardController
 * @author Nozibul Islam
 * @version 1.0.0
 */

const catchAsync = require("../../../shared/utils/catchAsync");

/**
 * @desc    Get dashboard access
 * @route   GET /api/v1/dashboard
 * @access  Private (requires authentication + email verification)
 */
exports.getDashboard = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dashboard access granted',
    data: {
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        isEmailVerified: req.user.isEmailVerified,
      },
    },
  });
});