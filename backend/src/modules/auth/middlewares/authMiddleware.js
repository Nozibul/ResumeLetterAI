/**
 * @file authMiddleware.js
 * @description JWT authentication and authorization middleware
 * @module modules/auth/middlewares/authMiddleware
 * @author Nozibul Islam
 * @version 1.0.0
 *
 * Features:
 * - JWT token verification (cookies + headers)
 * - User authentication
 * - Activity tracking (for 30-day TTL auto-cleanup)
 * - Password change detection
 * - Account status validation
 * - Role-based access control (RBAC)
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../../../utils/AppError');
const catchAsync = require('../../../utils/catchAsync');

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

/**
 * Protect routes - verify JWT and authenticate user
 * @route   All protected routes
 * @access  Private
 */
exports.protect = catchAsync(async (req, res, next) => {
  // 1. Get token from cookies or authorization header
  let token;

  if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Check if token exists
  if (!token) {
    return next(new AppError('Please login to access this resource', 401));
  }

  // 3. Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please login again', 401));
    }
    return next(new AppError('Invalid token. Please login again', 401));
  }

  // 4. Check if user still exists
  const user = await User.findById(decoded.id).select('+passwordChangedAt');

  if (!user) {
    return next(new AppError('User no longer exists', 401));
  }

  // 5. Check if user account is active
  if (!user.isActive) {
    return next(new AppError('Account is deactivated. Please contact support', 403));
  }

  // 6. Check if password was changed after token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password recently changed. Please login again', 401));
  }

  // 7. Update last active timestamp (for TTL auto-cleanup)
  // This tracks user activity to prevent deletion after 30 days of inactivity
  await user.updateLastActive();

  // 8. Grant access - attach user to request
  req.user = user;
  next();
});

// ==========================================
// AUTHORIZATION MIDDLEWARE (RBAC)
// ==========================================

/**
 * Restrict access to specific roles
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'premium')
 * @example router.delete('/users/:id', protect, restrictTo('admin'), deleteUser)
 */
exports.restrictTo = (...roles) => {
  return (req, _, next) => {
    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// ==========================================
// OPTIONAL: EMAIL VERIFICATION CHECK
// ==========================================

/**
 * Require email verification for certain routes
 * @example router.post('/premium-feature', protect, requireEmailVerification, handler)
 */
exports.requireEmailVerification = catchAsync(async (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return next(new AppError('Please verify your email to access this feature', 403));
  }
  next();
});

// ==========================================
// OPTIONAL: ACCOUNT LOCK CHECK
// ==========================================

/**
 * Check if account is locked (can be used for sensitive operations)
 * @example router.delete('/account', protect, checkAccountLock, deleteAccount)
 */
exports.checkAccountLock = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+lockUntil');

  if (user.isLocked) {
    const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return next(
      new AppError(`Account temporarily locked. Try again in ${lockTimeRemaining} minutes`, 423)
    );
  }
  next();
});
