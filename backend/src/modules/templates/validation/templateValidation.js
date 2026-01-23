/**
 * @file templateValidation.js
 * @description Validation schemas for template operations with IT/ATS support
 * @module modules/template/validation/templateValidation
 * @author Nozibul Islam
 * @version 3.0.0
 */

const { z } = require('zod');

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Sanitizes string input to prevent XSS attacks
 * @param {string} str - Input string
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (!str) return str;
  return str
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/\bon\w+\s*=/gi, '') // Remove event handlers like onclick=
    .trim();
};

// ==========================================
// REUSABLE SCHEMAS
// ==========================================

/**
 * MongoDB ObjectId validation schema
 */
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid template ID format');

/**
 * Category enum with IT and ATS support
 */
const categoryEnum = z.enum(
  ['ats-friendly', 'corporate', 'executive', 'creative', 'it'],
  {
    errorMap: () => ({
      message:
        'Invalid category. Must be one of: ats-friendly, corporate, executive, creative, it',
    }),
  }
);

/**
 * Field type enum for template structure
 */
const fieldTypeEnum = z.enum(
  ['text', 'email', 'url', 'phone', 'textarea', 'date', 'array', 'tags'],
  {
    errorMap: () => ({ message: 'Invalid field type' }),
  }
);

/**
 * Section ID enum including IT-specific sections
 */
const sectionIdEnum = z.enum(
  [
    'header',
    'summary',
    'experience',
    'projects',
    'skills',
    'education',
    'certifications',
    'competitiveProgramming',
    'achievements',
    'languages',
    'references',
  ],
  {
    errorMap: () => ({ message: 'Invalid section ID' }),
  }
);

/**
 * Sanitized string schema with XSS protection
 */
const sanitizedStringSchema = (maxLength = 500) =>
  z
    .string()
    .trim()
    .transform(sanitizeString)
    .refine((val) => val.length <= maxLength, {
      message: `String cannot exceed ${maxLength} characters`,
    });

/**
 * Tag schema with validation and sanitization
 */
const tagSchema = z
  .string()
  .min(1, 'Tag cannot be empty')
  .max(30, 'Tag cannot exceed 30 characters')
  .regex(
    /^[a-zA-Z0-9-_\s]+$/,
    'Tag can only contain alphanumeric characters, hyphens, underscores, and spaces'
  )
  .transform((val) => sanitizeString(val).toLowerCase());

/**
 * Tags array schema with uniqueness validation
 */
const tagsArraySchema = z
  .array(tagSchema)
  .max(10, 'Cannot have more than 10 tags')
  .refine((tags) => tags.length === new Set(tags).size, {
    message: 'Tags must be unique',
  });

/**
 * Field schema for template structure
 */
const fieldSchema = z.object({
  fieldName: sanitizedStringSchema(100),
  fieldType: fieldTypeEnum,
  isRequired: z.boolean().default(false),
  placeholder: sanitizedStringSchema(200).optional(),
});

/**
 * Section schema for template structure
 */
const sectionSchema = z.object({
  sectionId: sectionIdEnum,
  sectionName: sanitizedStringSchema(100),
  isRequired: z.boolean().default(false),
  order: z
    .number()
    .int()
    .min(1, 'Order must be at least 1')
    .max(50, 'Order cannot exceed 50'),
  fields: z
    .array(fieldSchema)
    .min(1, 'Each section must have at least one field')
    .refine(
      (fields) => {
        const fieldNames = fields.map((f) => f.fieldName);
        return fieldNames.length === new Set(fieldNames).size;
      },
      { message: 'Field names must be unique within a section' }
    ),
});

/**
 * Template settings schema for IT/ATS customization
 */
const templateSettingsSchema = z
  .object({
    locked: z
      .object({
        colorScheme: z.boolean().optional(),
        layoutColumns: z.boolean().optional(),
        fontFamily: z.boolean().optional(),
        graphics: z.boolean().optional(),
      })
      .optional(),

    defaults: z
      .object({
        colorScheme: z
          .string()
          .regex(
            /^#[0-9A-Fa-f]{6}$/,
            'Invalid color format. Must be hex format (e.g., #FF5733)'
          )
          .optional(),
        layoutColumns: z.number().int().min(1).max(2).optional(),
        fontFamily: z.string().trim().optional(),
        namePosition: z.enum(['left', 'center', 'right']).optional(),
        nameCase: z.enum(['uppercase', 'capitalize', 'normal']).optional(),
        photoEnabled: z.boolean().optional(),
        linkedinEnabled: z.boolean().optional(),
        githubEnabled: z.boolean().optional(),
        portfolioEnabled: z.boolean().optional(),
        leetcodeEnabled: z.boolean().optional(),
      })
      .optional(),

    customizable: z
      .object({
        namePosition: z.boolean().optional(),
        nameCase: z.boolean().optional(),
        sectionOrder: z.boolean().optional(),
        sectionVisibility: z.boolean().optional(),
        sectionTitles: z.boolean().optional(),
        photoEnabled: z.boolean().optional(),
      })
      .optional(),
  })
  .optional();

/**
 * Template structure schema
 */
const structureSchema = z.object({
  sections: z
    .array(sectionSchema)
    .min(1, 'Template must have at least one section')
    .refine(
      (sections) => {
        const orders = sections.map((s) => s.order);
        return orders.length === new Set(orders).size;
      },
      { message: 'Section orders must be unique' }
    )
    .refine(
      (sections) => {
        const sectionIds = sections.map((s) => s.sectionId);
        return sectionIds.length === new Set(sectionIds).size;
      },
      { message: 'Section IDs must be unique' }
    ),
});

// ==========================================
// BASE VALIDATION WRAPPER
// ==========================================

/**
 * Creates a standard validation schema with body, params, query, cookies
 * @param {Object} config - Configuration object
 * @param {Object} config.params - Params schema (optional)
 * @param {Object} config.query - Query schema (optional)
 * @param {Object} config.body - Body schema (optional)
 * @returns {ZodObject} Complete validation schema
 */
const createValidationSchema = ({ params, query, body } = {}) => {
  return z.object({
    params: params || z.object({}).optional(),
    query: query || z.object({}).optional(),
    body: body || z.any().optional(),
    cookies: z.any().optional(),
  });
};

// ==========================================
// PUBLIC ROUTE VALIDATIONS
// ==========================================

/**
 * Get all templates validation
 */
exports.getTemplatesQuerySchema = createValidationSchema({
  query: z
    .object({
      category: categoryEnum.optional(),
    })
    .strict(),
});

/**
 * Get template by ID validation
 */
exports.getTemplateByIdSchema = createValidationSchema({
  params: z.object({
    id: objectIdSchema,
  }),
});

/**
 * Get template preview validation
 */
exports.getTemplatePreviewSchema = createValidationSchema({
  params: z.object({
    id: objectIdSchema,
  }),
});

/**
 * Get category stats validation
 */
exports.getCategoryStatsSchema = createValidationSchema();

// ==========================================
// PROTECTED ROUTE VALIDATIONS
// ==========================================

/**
 * Create template validation
 */
exports.createTemplateSchema = createValidationSchema({
  body: z.object({
    category: categoryEnum,
    description: sanitizedStringSchema(500).optional(),
    previewUrl: z.string().url('Preview URL must be a valid URL').trim(),
    thumbnailUrl: z.string().url('Thumbnail URL must be a valid URL').trim(),
    tags: tagsArraySchema.default([]),
    isPremium: z.boolean().default(false),
    structure: structureSchema,
    settings: templateSettingsSchema,
  }),
  // .strict(),
});

/**
 * Update template validation
 */
exports.updateTemplateSchema = createValidationSchema({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      category: categoryEnum.optional(),
      description: sanitizedStringSchema(500).optional(),
      previewUrl: z
        .string()
        .url('Preview URL must be a valid URL')
        .trim()
        .optional(),
      thumbnailUrl: z
        .string()
        .url('Thumbnail URL must be a valid URL')
        .trim()
        .optional(),
      tags: tagsArraySchema.optional(),
      isPremium: z.boolean().optional(),
      structure: structureSchema.optional(),
      settings: templateSettingsSchema,
      isActive: z.boolean().optional(),
    })
    .strict()
    .refine(
      (data) => {
        const meaningfulFields = Object.keys(data).filter(
          (key) => data[key] !== undefined
        );
        return meaningfulFields.length > 0;
      },
      {
        message: 'At least one field must be provided for update',
      }
    ),
});

/**
 * Duplicate template validation
 */
exports.duplicateTemplateSchema = createValidationSchema({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      description: sanitizedStringSchema(500).optional(),
    })
    .strict()
    .optional()
    .default({}),
});

// ==========================================
// SOFT DELETE MANAGEMENT VALIDATIONS
// ==========================================

/**
 * Get soft-deleted templates validation
 */
exports.getDeletedTemplatesSchema = createValidationSchema({
  query: z
    .object({
      category: categoryEnum.optional(),
    })
    .strict(),
});

/**
 * Restore template validation
 */
exports.restoreTemplateSchema = createValidationSchema({
  params: z.object({
    id: objectIdSchema,
  }),
});

/**
 * Permanent delete template validation
 */
exports.permanentDeleteTemplateSchema = createValidationSchema({
  params: z.object({
    id: objectIdSchema,
  }),
});

/**
 * Soft delete template validation
 */
exports.deleteTemplateSchema = createValidationSchema({
  params: z.object({
    id: objectIdSchema,
  }),
});
