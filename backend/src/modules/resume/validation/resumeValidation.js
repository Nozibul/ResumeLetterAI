/**
 * @file resumeValidation.js
 * @description Validation schemas for resume operations (Production-Ready v2.1)
 * @module modules/resume/validation/resumeValidation
 * @author Nozibul Islam
 * @version 2.1.0
 * @updated Fixed all validation issues, improved performance & security
 */

const { z } = require('zod');

// ==========================================
// CONSTANTS
// ==========================================

const LIMITS = {
  MAX_WORK_EXPERIENCES: 50,
  MAX_PROJECTS: 30,
  MAX_EDUCATIONS: 10,
  MAX_CERTIFICATIONS: 30,
  MAX_ACHIEVEMENTS: 30,
  MAX_LANGUAGES: 20,
  MAX_CP_PLATFORMS: 10,
  MAX_SKILLS_PER_CATEGORY: 20,
  MAX_RESPONSIBILITIES: 20,
  MAX_HIGHLIGHTS: 10,
  MAX_TECHNOLOGIES: 30,
};

/**
 * Valid section names enum
 */
const sectionNameSchema = z.enum(
  [
    'personalInfo',
    'summary',
    'skills',
    'workExperience',
    'projects',
    'education',
    'certifications',
    'competitiveProgramming',
    'achievements',
    'languages',
  ],
  {
    errorMap: () => ({ message: 'Invalid section name' }),
  }
);

/**
 * Section Visibility Schema (Enum-based, Reusable)
 * ✅ FIXED - Manual definition instead of dynamic
 */
const sectionVisibilitySchema = z
  .object({
    personalInfo: z.boolean().optional(),
    summary: z.boolean().optional(),
    skills: z.boolean().optional(),
    workExperience: z.boolean().optional(),
    projects: z.boolean().optional(),
    education: z.boolean().optional(),
    certifications: z.boolean().optional(),
    competitiveProgramming: z.boolean().optional(),
    achievements: z.boolean().optional(),
    languages: z.boolean().optional(),
  })
  .partial();

// ==========================================
// REUSABLE SCHEMAS
// ==========================================

/**
 * MongoDB ObjectId validation (Optimized with length check)
 */
const objectIdSchema = z
  .string()
  .trim()
  .length(24, 'ID must be 24 characters')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format');

/**
 * URL validation - Only HTTP/HTTPS (Security enhanced)
 */
const urlOrEmpty = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const url = new URL(val);
        // শুধু HTTP/HTTPS allow - Security improvement
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Must be a valid HTTP/HTTPS URL' }
  )
  .optional()
  .default('');

/**
 * Date schema - Complete (month AND year)
 */
const completeDateSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(1).max(2100),
});

/**
 * Non-empty string array helper (Performance optimized)
 * ✅ FIXED - Added default parameter
 */
const nonEmptyStringArray = (max = 50) =>
  z.array(z.string().trim().min(1)).max(max);

// ==========================================
// MAIN SCHEMAS
// ==========================================

/**
 * Personal Info Schema (Enhanced validation)
 */
const personalInfoSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  jobTitle: z.string().trim().min(1, 'Job title is required').max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email format')
    .refine(
      (val) =>
        !val.endsWith('@example.com') &&
        !val.endsWith('@test.com') &&
        !val.endsWith('@temp.com'),
      { message: 'Please use a real email address' }
    ),
  phone: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone format')
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
      },
      { message: 'Phone must contain 10-15 digits' }
    ),
  location: z.string().trim().optional().default(''),
  linkedin: urlOrEmpty,
  github: urlOrEmpty,
  portfolio: urlOrEmpty,
  leetcode: urlOrEmpty,
  photoUrl: urlOrEmpty,
});

/**
 * Summary Schema
 */
const summarySchema = z
  .object({
    text: z.string().trim().max(2000).optional().default(''),
    isVisible: z.boolean().default(true),
  })
  .optional()
  .default({ text: '', isVisible: true });

/**
 * Work Experience Schema (Fixed date validation logic)
 */
const workExperienceSchema = z
  .object({
    _id: objectIdSchema.optional(),
    jobTitle: z.string().trim().min(1, 'Job title is required'),
    company: z.string().trim().min(1, 'Company name is required'),
    location: z.string().trim().optional().default(''),
    startDate: completeDateSchema,
    endDate: completeDateSchema.optional(),
    currentlyWorking: z.boolean().default(false),
    responsibilities: nonEmptyStringArray(LIMITS.MAX_RESPONSIBILITIES),
    order: z.number().int().min(0).default(0),
  })
  .refine(
    (data) => {
      // FIX: Clear conflict handling
      if (data.currentlyWorking && data.endDate) {
        return false; // Cannot have both
      }
      if (!data.currentlyWorking && !data.endDate) {
        return false; // Must have endDate if not working
      }
      return true;
    },
    {
      message:
        'Cannot have end date when currently working, or missing end date when not currently working',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (!data.endDate || data.currentlyWorking) return true;

      const start = data.startDate.year * 12 + data.startDate.month;
      const end = data.endDate.year * 12 + data.endDate.month;

      // FIX: Allow same month (>= instead of >)
      return end >= start;
    },
    {
      message: 'End date must be same or after start date',
      path: ['endDate'],
    }
  );

/**
 * Project Schema
 */
const projectSchema = z.object({
  _id: objectIdSchema.optional(),
  projectName: z.string().trim().min(1, 'Project name is required').max(150),
  technologies: nonEmptyStringArray(LIMITS.MAX_TECHNOLOGIES),
  description: z.string().trim().max(1000).optional().default(''),
  liveUrl: urlOrEmpty,
  sourceCode: urlOrEmpty,
  highlights: nonEmptyStringArray(LIMITS.MAX_HIGHLIGHTS),
  order: z.number().int().min(0).default(0),
});

/**
 * Education Schema
 */
const educationSchema = z.object({
  _id: objectIdSchema.optional(),
  degree: z.string().trim().min(1, 'Degree is required').max(150),
  institution: z.string().trim().min(1, 'Institution is required').max(200),
  location: z.string().trim().optional().default(''),
  graduationDate: completeDateSchema,
  gpa: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true; // Optional field

        const numericMatch = val.match(/^[0-4](\.\d{1,2})?$/);
        if (!numericMatch) return false;

        const num = parseFloat(val);
        return num >= 0 && num <= 4;
      },
      {
        message: 'GPA must be a number between 0 and 4 (e.g., 3.75, 3.5, 4.00)',
      }
    )
    .optional()
    .default(''),
  order: z.number().int().min(0).default(0),
});

/**
 * Skills Schema
 */
const skillsSchema = z
  .object({
    programmingLanguages: nonEmptyStringArray(LIMITS.MAX_SKILLS_PER_CATEGORY),
    frontend: nonEmptyStringArray(LIMITS.MAX_SKILLS_PER_CATEGORY),
    backend: nonEmptyStringArray(LIMITS.MAX_SKILLS_PER_CATEGORY),
    database: nonEmptyStringArray(15),
    devOps: nonEmptyStringArray(15),
    tools: nonEmptyStringArray(LIMITS.MAX_SKILLS_PER_CATEGORY),
    other: nonEmptyStringArray(LIMITS.MAX_SKILLS_PER_CATEGORY),
  })
  .optional()
  .default({
    programmingLanguages: [],
    frontend: [],
    backend: [],
    database: [],
    devOps: [],
    tools: [],
    other: [],
  });

/**
 * Competitive Programming Schema
 */
const competitiveProgrammingSchema = z.object({
  _id: objectIdSchema.optional(),
  platform: z.string().trim().min(1, 'Platform name is required').max(50),
  problemsSolved: z.string().trim().optional().default(''),
  badges: z.string().trim().optional().default(''),
  profileUrl: urlOrEmpty,
  description: z.string().trim().max(500).optional().default(''),
  order: z.number().int().min(0).default(0),
});

/**
 * Certification Schema
 */
const certificationSchema = z.object({
  _id: objectIdSchema.optional(),
  certificationName: z
    .string()
    .trim()
    .min(1, 'Certification name is required')
    .max(200),
  issuer: z.string().trim().max(150).optional().default(''),
  issueDate: completeDateSchema,
  credentialUrl: urlOrEmpty,
  order: z.number().int().min(0).default(0),
});

/**
 * Language Schema
 */
const languageSchema = z.object({
  _id: objectIdSchema.optional(),
  language: z.string().trim().min(1, 'Language is required').max(50),
  proficiency: z
    .enum(['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'])
    .default('Professional'),
});

/**
 * Achievement Schema
 */
const achievementSchema = z.object({
  _id: objectIdSchema.optional(),
  title: z.string().trim().min(1, 'Achievement title is required').max(200),
  description: z.string().trim().max(1000).optional().default(''),
  date: completeDateSchema.optional(),
  order: z.number().int().min(0).default(0),
});

/**
 * Customization Schema
 * ✅ FIXED - z.record() signature for Zod v4
 */
const customizationSchema = z
  .object({
    namePosition: z.enum(['left', 'center', 'right']).default('center'),
    nameCase: z
      .enum(['uppercase', 'capitalize', 'normal'])
      .default('uppercase'),
    colorScheme: z
      .string()
      .trim()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format')
      .default('#000000'),
    fontFamily: z.string().trim().default('Arial'),
    sectionTitles: z
      .record(z.string(), z.string().trim().min(1).max(50)) // ✅ FIXED
      .optional()
      .default({}),
  })
  .optional()
  .default({
    namePosition: 'center',
    nameCase: 'uppercase',
    colorScheme: '#000000',
    fontFamily: 'Arial',
    sectionTitles: {},
  });

// ==========================================
// MAIN VALIDATION SCHEMAS
// ==========================================

/**
 * Create Resume Validation
 * ✅ REMOVED .strict() - Zod v4 issue
 */
exports.createResumeSchema = z.object({
  body: z.object({
    templateId: objectIdSchema,
    title: z.string().trim().min(1).max(100).default('My Resume'),
    personalInfo: personalInfoSchema,
    summary: summarySchema,
    workExperience: z
      .array(workExperienceSchema)
      .max(LIMITS.MAX_WORK_EXPERIENCES)
      .default([]),
    projects: z.array(projectSchema).max(LIMITS.MAX_PROJECTS).default([]),
    education: z.array(educationSchema).max(LIMITS.MAX_EDUCATIONS).default([]),
    skills: skillsSchema,
    competitiveProgramming: z
      .array(competitiveProgrammingSchema)
      .max(LIMITS.MAX_CP_PLATFORMS)
      .default([]),
    certifications: z
      .array(certificationSchema)
      .max(LIMITS.MAX_CERTIFICATIONS)
      .default([]),
    languages: z.array(languageSchema).max(LIMITS.MAX_LANGUAGES).default([]),
    achievements: z
      .array(achievementSchema)
      .max(LIMITS.MAX_ACHIEVEMENTS)
      .default([]),
    sectionOrder: z.array(z.string().trim()).optional().default([]),
    sectionVisibility: sectionVisibilitySchema.optional().default({}),
    customization: customizationSchema,
  }),
});

/**
 * Update Resume Validation (Fixed: Removed defaults from optional fields)
 * ✅ REMOVED .strict()
 */
exports.updateResumeSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      title: z.string().trim().min(1).max(100).optional(),
      personalInfo: personalInfoSchema.optional(),

      // FIX: No defaults in update schema to prevent data loss
      summary: z
        .object({
          text: z.string().trim().max(2000).optional(),
          isVisible: z.boolean().optional(),
        })
        .optional(),

      workExperience: z
        .array(workExperienceSchema)
        .max(LIMITS.MAX_WORK_EXPERIENCES)
        .optional(),

      projects: z.array(projectSchema).max(LIMITS.MAX_PROJECTS).optional(),

      education: z.array(educationSchema).max(LIMITS.MAX_EDUCATIONS).optional(),

      skills: z
        .object({
          programmingLanguages: nonEmptyStringArray(
            LIMITS.MAX_SKILLS_PER_CATEGORY
          ).optional(),
          frontend: nonEmptyStringArray(
            LIMITS.MAX_SKILLS_PER_CATEGORY
          ).optional(),
          backend: nonEmptyStringArray(
            LIMITS.MAX_SKILLS_PER_CATEGORY
          ).optional(),
          database: nonEmptyStringArray(15).optional(),
          devOps: nonEmptyStringArray(15).optional(),
          tools: nonEmptyStringArray(LIMITS.MAX_SKILLS_PER_CATEGORY).optional(),
          other: nonEmptyStringArray(LIMITS.MAX_SKILLS_PER_CATEGORY).optional(),
        })
        .optional(),

      competitiveProgramming: z
        .array(competitiveProgrammingSchema)
        .max(LIMITS.MAX_CP_PLATFORMS)
        .optional(),

      certifications: z
        .array(certificationSchema)
        .max(LIMITS.MAX_CERTIFICATIONS)
        .optional(),

      languages: z.array(languageSchema).max(LIMITS.MAX_LANGUAGES).optional(),

      achievements: z
        .array(achievementSchema)
        .max(LIMITS.MAX_ACHIEVEMENTS)
        .optional(),

      sectionOrder: z.array(z.string().trim()).optional(),

      sectionVisibility: sectionVisibilitySchema.optional(),

      customization: z
        .object({
          namePosition: z.enum(['left', 'center', 'right']).optional(),
          nameCase: z.enum(['uppercase', 'capitalize', 'normal']).optional(),
          colorScheme: z
            .string()
            .trim()
            .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format')
            .optional(),
          fontFamily: z.string().trim().optional(),
          sectionTitles: z
            .record(z.string(), z.string().trim().min(1).max(50))
            .optional(), // ✅ FIXED
        })
        .optional(),
    })
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
 * ✅ REMOVED .strict()
 */
exports.duplicateResumeSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      title: z.string().trim().min(1).max(100).optional(),
    })
    .optional()
    .default({}),
});

/**
 * Get User Resumes Query Validation (Optimized edge case handling)
 */
exports.getUserResumesQuerySchema = z.object({
  query: z
    .object({
      limit: z
        .string()
        .trim()
        .refine(
          (val) => {
            // Check if it's a valid positive integer
            if (!/^\d+$/.test(val)) return false;
            const num = parseInt(val);
            return num > 0 && num <= 100;
          },
          { message: 'Limit must be between 1 and 100' }
        )
        .transform(Number)
        .optional()
        .default('10'),

      sort: z.enum(['newest', 'oldest', 'title']).optional().default('newest'),
    })
    .optional()
    .default({ limit: '10', sort: 'newest' }),
});

// ==========================================
// ADDITIONAL VALIDATION SCHEMAS
// ==========================================

/**
 * Update Section Order Validation
 * ✅ REMOVED .strict()
 */
exports.updateSectionOrderSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    sectionOrder: z
      .array(z.string())
      .min(1, 'At least one section is required')
      .max(10, 'Maximum 10 sections allowed')
      .refine(
        (arr) => {
          const validSections = sectionNameSchema.options;
          return arr.every((item) => validSections.includes(item));
        },
        { message: 'Invalid section name in sectionOrder' }
      )
      .refine(
        (arr) => {
          const uniqueSections = new Set(arr);
          return uniqueSections.size === arr.length;
        },
        { message: 'Section order contains duplicate sections' }
      ),
  }),
});

/**
 * Update Section Visibility Validation
 * ✅ REMOVED .strict()
 */
exports.updateSectionVisibilitySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    sectionVisibility: sectionVisibilitySchema.refine(
      (obj) => Object.keys(obj).length > 0,
      {
        message: 'At least one valid section name visibility must be provided',
      }
    ),
  }),
});

/**
 * Switch Template Validation
 * REMOVED .strict()
 */
exports.switchTemplateSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    templateId: objectIdSchema,
  }),
});
