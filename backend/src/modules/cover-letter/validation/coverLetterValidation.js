/**
 * @file coverLetterValidation.js
 * @description Zod validation schemas for cover letter API operations
 * @module modules/cover-letter/validation/coverLetterValidation
 * @author Nozibul Islam
 * @version 1.0.0
 */

const { z } = require('zod');

const objectIdSchema = z
  .string()
  .trim()
  .length(24, 'ID must be exactly 24 characters')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format');

const toneSchema = z
  .enum(['professional', 'creative', 'concise', 'enthusiastic', 'formal'])
  .default('professional');

exports.generateCoverLetterSchema = z.object({
  body: z
    .object({
      resumeSource: z.enum(['db', 'paste', 'upload'], {
        errorMap: () => ({
          message: 'resumeSource must be db, paste, or upload',
        }),
      }),

      resumeId: objectIdSchema.optional(),

      resumeText: z.string().trim().optional(),

      jobDescription: z
        .string()
        .trim()
        .min(50, 'Job description must be at least 50 characters')
        .max(5000, 'Job description cannot exceed 5000 characters'),

      tone: toneSchema,
    })
    .refine(
      (data) => {
        if (data.resumeSource === 'db') return !!data.resumeId;
        return true;
      },
      {
        message: 'resumeId is required when resumeSource is "db"',
        path: ['resumeId'],
      }
    )
    .refine(
      (data) => {
        if (data.resumeSource === 'paste') {
          return !!data.resumeText && data.resumeText.length >= 100;
        }
        return true;
      },
      {
        message:
          'resumeText must be at least 100 characters when source is "paste"',
        path: ['resumeText'],
      }
    ),
});

exports.saveCoverLetterSchema = z.object({
  body: z.object({
    coverLetterId: objectIdSchema,
  }),
});

exports.getCoverLetterSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
