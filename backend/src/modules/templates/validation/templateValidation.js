/**
 * @file templateValidation.js
 * @description Validation schemas for template operations
 * @module modules/template/validation/templateValidation
 * @author Nozibul Islam
 * @version 1.0.0
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
 * Category enum
 */
const categoryEnum = z.enum(['ats-friendly', 'corporate', 'executive', 'creative', 'it'], {
  errorMap: () => ({ message: 'Invalid category' }),
});

/**
 * Field type enum
 */
const fieldTypeEnum = z.enum(['text', 'email', 'url', 'phone', 'textarea', 'date', 'array']);

/**
 * Section ID enum
 */
const sectionIdEnum = z.enum([
  'header',
  'profile',
  'experience',
  'skills',
  'education',
  'projects',
  'achievements',
  'references',
  'technologies',
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
    description: z.string().max(500, 'Description cannot exceed 500 characters').trim().optional(),
    previewUrl: z
      .string()
      .url('Preview URL must be a valid URL')
      .regex(/^https?:\/\/.+/, 'Preview URL must start with http:// or https://')
      .trim(),
    thumbnailUrl: z
      .string()
      .url('Thumbnail URL must be a valid URL')
      .regex(/^https?:\/\/.+/, 'Thumbnail URL must start with http:// or https://')
      .trim(),
    tags: z
      .array(z.string().trim().toLowerCase())
      .max(10, 'Cannot have more than 10 tags')
      .optional()
      .default([]),
    isPremium: z.boolean().optional().default(false),
    structure: structureSchema,
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
        .regex(/^https?:\/\/.+/, 'Preview URL must start with http:// or https://')
        .trim()
        .optional(),
      thumbnailUrl: z
        .string()
        .url('Thumbnail URL must be a valid URL')
        .regex(/^https?:\/\/.+/, 'Thumbnail URL must start with http:// or https://')
        .trim()
        .optional(),
      tags: z
        .array(z.string().trim().toLowerCase())
        .max(10, 'Cannot have more than 10 tags')
        .optional(),
      isPremium: z.boolean().optional(),
      structure: structureSchema.optional(),
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