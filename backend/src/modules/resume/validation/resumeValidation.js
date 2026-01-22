/**
 * @file resumeValidation.js
 * @description Validation schemas for resume operations
 * @module modules/resume/validation/resumeValidation
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
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

/**
 * Date schema (month/year)
 */
const dateSchema = z
  .object({
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(1950).max(2100).optional(),
  })
  .optional();

/**
 * Personal Info Schema
 */
const personalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100).trim(),
  jobTitle: z.string().min(1, 'Job title is required').max(100).trim(),
  email: z.string().email('Invalid email format').trim().toLowerCase(),
  phone: z.string().min(1, 'Phone is required').trim(),
  location: z.string().trim().optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  portfolio: z.string().url().optional().or(z.literal('')),
  leetcode: z.string().url().optional().or(z.literal('')),
  photoUrl: z.string().url().optional().or(z.literal('')),
});

/**
 * Summary Schema
 */
const summarySchema = z
  .object({
    text: z.string().max(1000).trim().optional(),
    isVisible: z.boolean().optional().default(true),
  })
  .optional();

/**
 * Work Experience Schema
 */
const workExperienceSchema = z.object({
  _id: objectIdSchema.optional(),
  jobTitle: z.string().min(1, 'Job title is required').trim(),
  company: z.string().min(1, 'Company name is required').trim(),
  location: z.string().trim().optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  currentlyWorking: z.boolean().optional().default(false),
  responsibilities: z.array(z.string().trim()).optional().default([]),
  order: z.number().int().min(0).optional().default(0),
});

/**
 * Project Schema
 */
const projectSchema = z.object({
  _id: objectIdSchema.optional(),
  projectName: z.string().min(1, 'Project name is required').trim(),
  technologies: z.array(z.string().trim()).optional().default([]),
  description: z.string().max(500).trim().optional(),
  liveUrl: z.string().url().optional().or(z.literal('')),
  sourceCode: z.string().url().optional().or(z.literal('')),
  highlights: z.array(z.string().trim()).optional().default([]),
  order: z.number().int().min(0).optional().default(0),
});

/**
 * Education Schema
 */
const educationSchema = z.object({
  _id: objectIdSchema.optional(),
  degree: z.string().min(1, 'Degree is required').trim(),
  institution: z.string().min(1, 'Institution is required').trim(),
  location: z.string().trim().optional(),
  graduationDate: dateSchema,
  gpa: z.string().trim().optional(),
  order: z.number().int().min(0).optional().default(0),
});

/**
 * Skills Schema
 */
const skillsSchema = z
  .object({
    programmingLanguages: z.array(z.string().trim()).optional().default([]),
    frontend: z.array(z.string().trim()).optional().default([]),
    backend: z.array(z.string().trim()).optional().default([]),
    database: z.array(z.string().trim()).optional().default([]),
    devOps: z.array(z.string().trim()).optional().default([]),
    tools: z.array(z.string().trim()).optional().default([]),
    other: z.array(z.string().trim()).optional().default([]),
  })
  .optional();

/**
 * Competitive Programming Schema
 */
const competitiveProgrammingSchema = z.object({
  _id: objectIdSchema.optional(),
  platform: z.string().min(1, 'Platform name is required').trim(),
  problemsSolved: z.string().trim().optional(),
  badges: z.string().trim().optional(),
  profileUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().trim().optional(),
});

/**
 * Certification Schema
 */
const certificationSchema = z.object({
  _id: objectIdSchema.optional(),
  certificationName: z.string().min(1, 'Certification name is required').trim(),
  issuer: z.string().trim().optional(),
  issueDate: dateSchema,
  credentialUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().int().min(0).optional().default(0),
});

/**
 * Language Schema
 */
const languageSchema = z.object({
  _id: objectIdSchema.optional(),
  language: z.string().min(1, 'Language is required').trim(),
  proficiency: z
    .enum(['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'])
    .optional()
    .default('Professional'),
});

/**
 * Achievement Schema
 */
const achievementSchema = z.object({
  _id: objectIdSchema.optional(),
  title: z.string().min(1, 'Achievement title is required').trim(),
  description: z.string().trim().optional(),
  date: dateSchema,
  order: z.number().int().min(0).optional().default(0),
});

/**
 * Customization Schema
 */
const customizationSchema = z
  .object({
    namePosition: z
      .enum(['left', 'center', 'right'])
      .optional()
      .default('center'),
    nameCase: z
      .enum(['uppercase', 'capitalize', 'normal'])
      .optional()
      .default('uppercase'),
    colorScheme: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
      .optional()
      .default('#000000'),
    fontFamily: z.string().trim().optional().default('Arial'),
    sectionTitles: z.record(z.string()).optional(),
  })
  .optional();

// ==========================================
// MAIN VALIDATION SCHEMAS
// ==========================================

/**
 * Create Resume Validation
 */
exports.createResumeSchema = z.object({
  body: z.object({
    templateId: objectIdSchema,
    title: z.string().min(1).max(100).trim().optional().default('My Resume'),
    personalInfo: personalInfoSchema,
    summary: summarySchema,
    workExperience: z.array(workExperienceSchema).optional().default([]),
    projects: z.array(projectSchema).optional().default([]),
    education: z.array(educationSchema).optional().default([]),
    skills: skillsSchema,
    competitiveProgramming: z
      .array(competitiveProgrammingSchema)
      .optional()
      .default([]),
    certifications: z.array(certificationSchema).optional().default([]),
    languages: z.array(languageSchema).optional().default([]),
    achievements: z.array(achievementSchema).optional().default([]),
    sectionOrder: z.array(z.string()).optional(),
    sectionVisibility: z.record(z.boolean()).optional(),
    customization: customizationSchema,
  }),
});

/**
 * Update Resume Validation
 */
exports.updateResumeSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      title: z.string().min(1).max(100).trim().optional(),
      personalInfo: personalInfoSchema.optional(),
      summary: summarySchema,
      workExperience: z.array(workExperienceSchema).optional(),
      projects: z.array(projectSchema).optional(),
      education: z.array(educationSchema).optional(),
      skills: skillsSchema,
      competitiveProgramming: z.array(competitiveProgrammingSchema).optional(),
      certifications: z.array(certificationSchema).optional(),
      languages: z.array(languageSchema).optional(),
      achievements: z.array(achievementSchema).optional(),
      sectionOrder: z.array(z.string()).optional(),
      sectionVisibility: z.record(z.boolean()).optional(),
      customization: customizationSchema,
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

/**
 * Get Resume by ID Validation
 */
exports.getResumeByIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

/**
 * Delete Resume Validation
 */
exports.deleteResumeSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

/**
 * Duplicate Resume Validation
 */
exports.duplicateResumeSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      title: z.string().min(1).max(100).trim().optional(),
    })
    .optional()
    .default({}),
});

/**
 * Get User Resumes Query Validation
 */
exports.getUserResumesQuerySchema = z.object({
  query: z
    .object({
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
      sort: z.string().optional(),
    })
    .optional()
    .default({}),
});
