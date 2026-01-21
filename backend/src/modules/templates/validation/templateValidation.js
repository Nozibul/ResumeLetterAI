/**
 * @file templateValidation.js
 * @description Validation schemas for template operations with IT/ATS support
 * @module modules/template/validation/templateValidation
 * @author Nozibul Islam
 * @version 2.0.0
 */

const { z } = require('zod');

// ==========================================
// REUSABLE SCHEMAS
// ==========================================

/**
 * MongoDB ObjectId validation
 */
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid template ID format');

/**
 * Category enum (added 'it')
 */
const categoryEnum = z.enum(
  ['ats-friendly', 'corporate', 'executive', 'creative', 'it'],
  {
    errorMap: () => ({ message: 'Invalid category' }),
  }
);

/**
 * Field type enum (added 'tags')
 */
const fieldTypeEnum = z.enum([
  'text',
  'email',
  'url',
  'phone',
  'textarea',
  'date',
  'array',
  'tags',
]);

/**
 * Section ID enum (added IT-specific sections)
 */
const sectionIdEnum = z.enum([
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
]);

/**
 * Field schema for template structure
 */
const fieldSchema = z.object({
  fieldName: z.string().min(1, 'Field name is required').trim(),
  fieldType: fieldTypeEnum,
  isRequired: z.boolean().optional().default(false),
  placeholder: z.string().trim().optional(),
});

/**
 * Section schema for template structure
 */
const sectionSchema = z.object({
  sectionId: sectionIdEnum,
  sectionName: z.string().min(1, 'Section name is required').trim(),
  isRequired: z.boolean().optional().default(false),
  order: z.number().int().min(1, 'Order must be at least 1'),
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
 * Template settings schema (for IT/ATS templates)
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
          .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
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
// QUERY VALIDATION
// ==========================================

/**
 * Get templates query validation
 */
exports.getTemplatesQuerySchema = z.object({
  query: z
    .object({
      category: categoryEnum.optional(),
    })
    .strict(),
});

/**
 * Get template by ID validation
 */
exports.getTemplateByIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

/**
 * Create template validation
 */
exports.createTemplateSchema = z.object({
  body: z.object({
    category: categoryEnum,
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .trim()
      .optional(),
    previewUrl: z
      .string()
      .url('Preview URL must be a valid URL')
      .regex(
        /^https?:\/\/.+/,
        'Preview URL must start with http:// or https://'
      )
      .trim(),
    thumbnailUrl: z
      .string()
      .url('Thumbnail URL must be a valid URL')
      .regex(
        /^https?:\/\/.+/,
        'Thumbnail URL must start with http:// or https://'
      )
      .trim(),
    tags: z
      .array(z.string().trim().toLowerCase())
      .max(10, 'Cannot have more than 10 tags')
      .optional()
      .default([]),
    isPremium: z.boolean().optional().default(false),
    structure: structureSchema,
    settings: templateSettingsSchema, // Added settings validation
  }),
});

/**
 * Update template validation
 */
exports.updateTemplateSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      category: categoryEnum.optional(),
      description: z
        .string()
        .max(500, 'Description cannot exceed 500 characters')
        .trim()
        .optional(),
      previewUrl: z
        .string()
        .url('Preview URL must be a valid URL')
        .regex(
          /^https?:\/\/.+/,
          'Preview URL must start with http:// or https://'
        )
        .trim()
        .optional(),
      thumbnailUrl: z
        .string()
        .url('Thumbnail URL must be a valid URL')
        .regex(
          /^https?:\/\/.+/,
          'Thumbnail URL must start with http:// or https://'
        )
        .trim()
        .optional(),
      tags: z
        .array(z.string().trim().toLowerCase())
        .max(10, 'Cannot have more than 10 tags')
        .optional(),
      isPremium: z.boolean().optional(),
      structure: structureSchema.optional(),
      settings: templateSettingsSchema, // Added settings validation
      isActive: z.boolean().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

/**
 * Duplicate template validation
 */
exports.duplicateTemplateSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      description: z
        .string()
        .max(500, 'Description cannot exceed 500 characters')
        .trim()
        .optional(),
    })
    .optional()
    .default({}),
});
