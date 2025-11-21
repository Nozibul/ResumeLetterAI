/**
 * @file UserSession.js
 * @description Multi-device session tracking for JWT authentication
 * @module modules/auth/models/UserSession
 * @author Nozibul Islam
 * @version 1.0.0
 *
 * Purpose:
 * - Track user sessions across multiple devices
 * - Enable individual session revocation (logout from specific device)
 * - Security: Monitor suspicious login patterns
 * - Future: Show "Active Sessions" in user settings
 */

const mongoose = require('mongoose');

const UserSessionSchema = new mongoose.Schema(
  {
    // ==========================================
    // CORE FIELDS
    // ==========================================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Fast lookup by user
    },

    refreshToken: {
      type: String,
      required: true,
      unique: true,
      select: false, // Never return in queries by default
    },

    // ==========================================
    // DEVICE INFORMATION
    // ==========================================
    deviceInfo: {
      userAgent: { type: String, default: null },
      browser: { type: String, default: null },
      os: { type: String, default: null },
      device: { type: String, default: null }, // mobile/desktop/tablet
    },

    ipAddress: {
      type: String,
      default: null,
    },

    // ==========================================
    // SESSION STATUS
    // ==========================================
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true, // For TTL queries
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    versionKey: false,
  }
);

// ==========================================
// INDEXES
// ==========================================
// Compound index for active sessions per user
UserSessionSchema.index({ userId: 1, isActive: 1 });

// TTL Index: Auto-delete expired sessions (MongoDB automatic cleanup)
UserSessionSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    name: 'ttl_expired_sessions',
  }
);

// ==========================================
// STATIC METHODS
// ==========================================

/**
 * Create new session
 */
UserSessionSchema.statics.createSession = async function (
  userId,
  refreshToken,
  deviceInfo,
  ipAddress
) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return this.create({
    userId,
    refreshToken,
    deviceInfo,
    ipAddress,
    expiresAt,
  });
};

/**
 * Find active session by refresh token
 */
UserSessionSchema.statics.findByToken = function (refreshToken) {
  return this.findOne({
    refreshToken,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
};

/**
 * Get all active sessions for user
 */
UserSessionSchema.statics.getUserSessions = function (userId) {
  return this.find({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  })
    .select('deviceInfo ipAddress createdAt lastUsedAt')
    .sort('-lastUsedAt');
};

/**
 * Revoke specific session
 */
UserSessionSchema.statics.revokeSession = async function (sessionId) {
  return this.findByIdAndUpdate(sessionId, { isActive: false });
};

/**
 * Revoke all sessions for user (e.g., on password change)
 */
UserSessionSchema.statics.revokeAllUserSessions = async function (userId) {
  return this.updateMany({ userId }, { isActive: false });
};

/**
 * Update session last used time
 */
UserSessionSchema.statics.updateLastUsed = async function (refreshToken) {
  return this.findOneAndUpdate(
    { refreshToken, isActive: true },
    { lastUsedAt: new Date() },
    { new: true }
  );
};

/**
 * Clean up old sessions (optional manual cleanup)
 */
UserSessionSchema.statics.cleanupExpiredSessions = async function () {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

// ==========================================
// INSTANCE METHODS
// ==========================================

/**
 * Check if session is valid
 */
UserSessionSchema.methods.isValid = function () {
  return this.isActive && this.expiresAt > new Date();
};

// ==========================================
// MODEL EXPORT
// ==========================================
const UserSession = mongoose.model('UserSession', UserSessionSchema);
module.exports = UserSession;
