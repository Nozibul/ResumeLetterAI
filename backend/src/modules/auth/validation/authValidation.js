/**
 * @file authValidation.js
 * @description Validation schemas for authentication operations
 * @module modules/auth/validations/authValidation
 */

const { z } = require('zod');

// ==========================================
// REUSABLE SCHEMAS (DRY Principle)
// ==========================================

// Email schema
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .toLowerCase()
  .trim();

// Password schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase and number'
  );

// Full name schema
const fullNameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters')
  .max(100, 'Full name is too long')
  .trim();

// ==========================================
// AUTHENTICATION SCHEMAS
// ==========================================

/**
 * Register validation
 */
exports.registerSchema = z.object({
  body: z
    .object({
      fullName: fullNameSchema,
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

/**
 * Login validation
 */
exports.loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
});

// ==========================================
// PROFILE MANAGEMENT SCHEMAS
// ==========================================

/**
 * Update profile validation
 */
exports.updateProfileSchema = z.object({
  body: z
    .object({
      fullName: fullNameSchema.optional(),
      preferences: z
        .object({
          theme: z.enum(['light', 'dark']).optional(),
          language: z.string().optional(),
          notifications: z.boolean().optional(),
        })
        .optional(),
    })
    .refine((data) => data.fullName || data.preferences, {
      message: 'At least one field is required to update',
    }),
});

/**
 * Change password validation
 */
exports.changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: passwordSchema,
      confirmNewPassword: z.string().min(1, 'Please confirm new password'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: 'New passwords do not match',
      path: ['confirmNewPassword'],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: 'New password must be different from current password',
      path: ['newPassword'],
    }),
});

/**
 * Delete account validation
 */
exports.deleteAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1, 'Password is required to confirm deletetion'),
    confirmDeactivation: z.boolean().refine((val) => val === true, {
      message: 'Please confirm account deleteion',
    }),
  }),
});
