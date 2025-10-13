/**
 * @file User.js
 * @description Production-ready Mongoose User Model for ResumeLetterAI SaaS
 * @module modules/auth/models/User
 * @author Nozibul Islam
 * @version 1.0.0
 *
 * Design Principles:
 * - Security-first: bcrypt hashing, no plaintext passwords
 * - JWT-ready: supports access/refresh token authentication
 * - RBAC: Role-based access control with extensible roles
 * - Soft delete: isActive flag for data retention
 * - Audit trail: timestamps, login tracking, account locking
 * - Future-proof: metadata field for extensibility
 * - Performance: strategic indexing for common queries
 * - Global crypto import for performance
 * - Consolidated pre-save hooks
 * - Timezone-safe token expiration
 * - Case-insensitive email indexing
 * - Optimized JWT validation logic
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Global import for reusability

/**
 * User Schema Definition
 *
 * Core Philosophy:
 * - Essential fields only (no bloat)
 * - Validation at schema level (fail fast)
 * - Indexes for performance-critical queries
 * - Extensible through metadata for future needs
 */
const UserSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC INFORMATION
    // ==========================================
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [50, 'Full name cannot exceed 50 characters'],
      index: true, // For search functionality
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
      index: true, // Primary lookup field
    },

    // ==========================================
    // AUTHENTICATION
    // ==========================================
    password: {
      type: String,
      required: function () {
        // Password required only for email/password auth
        // OAuth users won't have password
        return !this.authProvider || this.authProvider === 'local';
      },
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return in queries by default
    },

    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
      index: true,
    },

    authProviderId: {
      type: String,
      default: null,
      // Unique identifier from OAuth provider
      sparse: true, // Allows null values while maintaining uniqueness
    },

    // ==========================================
    // AUTHORIZATION & ROLES
    // ==========================================
    role: {
      type: String,
      enum: {
        values: ['user', 'admin', 'premium'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
      index: true, // For role-based queries
    },

    // ==========================================
    // ACCOUNT STATUS & SECURITY
    // ==========================================
    isActive: {
      type: Boolean,
      default: true,
      index: true, // For filtering active users
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    emailVerificationToken: {
      type: String,
      select: false, // Never return in queries
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    passwordChangedAt: {
      type: Date,
      select: false,
    },

    // ==========================================
    // ACCOUNT LOCKING (Security)
    // ==========================================
    firstFailedAt: {
      type: Date,
      default: null,
      select: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    lockUntil: {
      type: Date,
      select: false,
    },

    // ==========================================
    // ACTIVITY TRACKING
    // ==========================================
    lastLoginAt: {
      type: Date,
      default: null,
    },

    lastLoginIP: {
      type: String,
      default: null,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
      index: true, // For TTL index and activity queries
    },

    // ==========================================
    // EXTENSIBILITY (Future-proof)
    // ==========================================
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
      // Example usage: { aiPreferences: {...}, customFields: {...} }
    },

    preferences: {
      language: {
        type: String,
        default: 'en',
        enum: ['en', 'bn'],
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
    versionKey: false, // Remove __v field
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remove sensitive fields from JSON response
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.emailVerificationToken;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ==========================================
// INDEXES FOR PERFORMANCE
// ==========================================

// Compound index for common query patterns
UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ createdAt: -1 }); // For sorting by registration date

// TTL Index: Auto-delete users inactive for 30 days
// MongoDB will automatically delete documents where lastActiveAt is older than 30 days
UserSchema.index(
  { lastActiveAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days in seconds
    name: 'ttl_inactive_users', // Custom index name
  }
);

// ==========================================
// VIRTUALS (Computed Properties)
// ==========================================

/**
 * Check if account is locked
 */
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * User profile summary (safe to expose)
 */
UserSchema.virtual('profile').get(function () {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    joinedAt: this.createdAt,
  };
});

// ==========================================
// PRE-SAVE MIDDLEWARE (Consolidated)
// ==========================================

/**
 * Unified pre-save hook for password hashing and login tracking
 * Consolidated for better performance (single hook execution)
 */
UserSchema.pre('save', async function (next) {
  try {
    // 1. Handle password hashing
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
      this.password = await bcrypt.hash(this.password, salt);

      // Set password changed timestamp (for JWT invalidation)
      if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000; // Subtract 1s to ensure token is valid
      }
    }

    // 2. Update login timestamp
    if (this.isModified('lastLoginAt') && !this.isNew) {
      this.lastLoginAt = Date.now();
    }

    next();
  } catch (error) {
    next(error);
  }
});

// ==========================================
// INSTANCE METHODS
// ==========================================

/**
 * Compare password for login
 * @param {string} candidatePassword - Plain text password
 * @returns {Promise<boolean>}
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

/**
 * Check if password was changed after JWT was issued
 * Optimized for performance and readability
 * @param {number} jwtIat - JWT issued at timestamp (Unix timestamp)
 * @returns {boolean}
 */
UserSchema.methods.changedPasswordAfter = function (jwtIat) {
  if (!this.passwordChangedAt) return false;

  const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return jwtIat < changedTimestamp;
};

/**
 * Update last active timestamp
 * Call this on every user activity (login, API calls, etc.)
 * @returns {Promise<void>}
 */
UserSchema.methods.updateLastActive = async function () {
  this.lastActiveAt = new Date();
  return this.save({ validateBeforeSave: false });
};

/**
 * Increment login attempts and lock account if threshold exceeded within time window
 * @returns {Promise<boolean>} - Returns true if account is locked
 */
UserSchema.methods.incLoginAttempts = async function () {
  const MAX_ATTEMPTS = 3;
  const ATTEMPT_WINDOW = 2 * 60 * 1000; // 2 minutes in milliseconds
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

  const now = Date.now();

  // If previous lock expired, reset counters and start fresh window
  if (this.lockUntil && this.lockUntil < now) {
    await this.updateOne({
      $set: { loginAttempts: 1, firstFailedAt: now },
      $unset: { lockUntil: 1 },
    });
    return false;
  }

  // If no window started or window expired, start a new window
  if (!this.firstFailedAt || now - this.firstFailedAt > ATTEMPT_WINDOW) {
    await this.updateOne({
      $set: { loginAttempts: 1, firstFailedAt: now },
    });
    return false;
  }

  // We are inside the attempt window -> increment attempts
  const currentAttempts = this.loginAttempts || 0;
  const newAttempts = currentAttempts + 1;
  const updates = { $inc: { loginAttempts: 1 } };

  // If this increment reaches threshold, lock the account
  if (newAttempts >= MAX_ATTEMPTS && !(this.lockUntil && this.lockUntil > now)) {
    updates.$set = {
      lockUntil: now + LOCK_TIME,
      loginAttempts: 0, // Reset for next window
    };
    updates.$unset = { firstFailedAt: 1 };

    await this.updateOne(updates);
    return true; // Account is now locked
  }

  // Just increment attempts (not locked yet)
  await this.updateOne(updates);
  return false;
};

/**
 * Reset login attempts after successful login
 */
UserSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1, firstFailedAt: 1 },
  });
};

/**
 * Generate password reset token (Timezone-safe)
 * @returns {string} - Plain reset token (hashed version saved in DB)
 */
UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash and save to database
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Token expires in 10 minutes (timezone-safe Date object)
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken; // Return plain token to send via email
};

/**
 * Generate email verification token (Timezone-safe)
 * @returns {string} - Plain verification token
 */
UserSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  // Token expires in 12 hours (timezone-safe Date object)
  this.emailVerificationExpires = new Date(Date.now() + 24 * 30 * 60 * 1000);

  return verificationToken;
};

// ==========================================
// STATIC METHODS (Model-level)
// ==========================================

/**
 * Find user by email (case-insensitive)
 * @param {string} email
 * @returns {Promise<User>}
 */
UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Find active users only
 * @param {object} filter - Additional filters
 * @returns {Promise<User[]>}
 */
UserSchema.statics.findActive = function (filter = {}) {
  return this.find({ ...filter, isActive: true });
};

/**
 * Find by reset token
 * @param {string} token - Plain reset token
 * @returns {Promise<User>}
 */
UserSchema.statics.findByResetToken = function (token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  return this.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
};

/**
 * Find by verification token
 * @param {string} token - Plain verification token
 * @returns {Promise<User>}
 */
UserSchema.statics.findByVerificationToken = function (token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  return this.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });
};

// ==========================================
// QUERY MIDDLEWARE
// ==========================================

/**
 * Exclude inactive users by default in find queries
 * Can be overridden by explicitly setting isActive: false
 */
UserSchema.pre(/^find/, function (next) {
  // 'this' is the query object
  if (!this.getQuery().hasOwnProperty('isActive')) {
    this.find({ isActive: { $ne: false } });
  }
  next();
});

// ==========================================
// MODEL EXPORT
// ==========================================

const User = mongoose.model('User', UserSchema);

module.exports = User;
