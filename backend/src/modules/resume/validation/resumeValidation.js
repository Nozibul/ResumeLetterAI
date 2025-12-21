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
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

/**
 * Header content schema
 */
const headerSchema = z
  .object({
    fullName: z.string().trim().optional(),
    position: z.string().trim().optional(),
    email: z.string().email('Invalid email').trim().optional(),
    phone: z.string().trim().optional(),
    linkedin: z.string().url('Invalid LinkedIn URL').trim().optional(),
    github: z.string().url('Invalid GitHub URL').trim().optional(),
    portfolio: z.string().url('Invalid portfolio URL').trim().optional(),
    location: z.string().trim().optional(),
  })
  .optional();

/**
 * Profile content schema
 */
const profileSchema = z
  .object({
    summary: z.string().trim().optional(),
  })
  .optional();

/**
 * Experience content schema
 */
const experienceSchema = z
  .object({
    companyName: z.string().trim().optional(),
    position: z.string().trim().optional(),
    startDate: z.string().or(z.date()).optional(),
    endDate: z.string().or(z.date()).optional(),
    currentlyWorking: z.boolean().optional(),
    description: z.string().trim().optional(),
    responsibilities: z.array(z.string().trim()).optional(),
  })
  .optional();

/**
 * Skill content schema
 */
const skillSchema = z
  .object({
    skillName: z.string().trim().optional(),
    proficiency: z.string().trim().optional(),
  })
  .optional();

/**
 * Education content schema
 */
const educationSchema = z
  .object({
    degree: z.string().trim().optional(),
    institution: z.string().trim().optional(),
    graduationYear: z.string().or(z.date()).optional(),
    cgpa: z.string().trim().optional(),
  })
  .optional();

/**
 * Project content schema
 */
const projectSchema = z
  .object({
    projectName: z.string().trim().optional(),
    description: z.string().trim().optional(),
    technologies: z.array(z.string().trim()).optional(),
    projectUrl: z.string().url('Invalid project URL').trim().optional(),
  })
  .optional();

/**
 * Achievement content schema
 */
const achievementSchema = z
  .object({
    title: z.string().trim().optional(),
    description: z.string().trim().optional(),
    date: z.string().or(z.date()).optional(),
  })
  .optional();

/**
 * Reference content schema
 */
const referenceSchema = z
  .object({
    name: z.string().trim().optional(),
    position: z.string().trim().optional(),
    company: z.string().trim().optional(),
    email: z.string().email('Invalid email').trim().optional(),
    phone: z.string().trim().optional(),
  })
  .optional();

/**
 * Technology content schema
 */
const technologySchema = z
  .object({
    category: z.string().trim().optional(),
    techStack: z.array(z.string().trim()).optional(),
  })
  .optional();

/**
 * Resume content schema (all sections)
 */
const contentSchema = z
  .object({
    header: headerSchema,
    profile: profileSchema,
    experience: z.array(experienceSchema).optional(),
    skills: z.array(skillSchema).optional(),
    education: z.array(educationSchema).optional(),
    projects: z.array(projectSchema).optional(),
    achievements: z.array(achievementSchema).optional(),
    references: z.array(referenceSchema).optional(),
    technologies: z.array(technologySchema).optional(),
  })
  .optional();

// ==========================================
// PARAMS VALIDATION
// ==========================================

/**
 * Get resume by ID validation
 */
exports.getResumeByIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

// ==========================================
// CREATE RESUME VALIDATION
// ==========================================

/**
 * Create resume validation
 */
exports.createResumeSchema = z.object({
  body: z.object({
    templateId: objectIdSchema,
    resumeTitle: z
      .string()
      .min(1, 'Resume title is required')
      .max(100, 'Resume title cannot exceed 100 characters')
      .trim()
      .optional(),
    content: contentSchema,
  }),
});

// ==========================================
// UPDATE RESUME VALIDATION
// ==========================================

/**
 * Update resume validation
 */
exports.updateResumeSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      content: contentSchema,
      isCompleted: z.boolean().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

// ==========================================
// UPDATE RESUME TITLE VALIDATION
// ==========================================

/**
 * Update resume title validation
 */
exports.updateResumeTitleSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    resumeTitle: z
      .string()
      .min(1, 'Resume title is required')
      .max(100, 'Resume title cannot exceed 100 characters')
      .trim(),
  }),
});

// ==========================================
// TOGGLE VISIBILITY VALIDATION
// ==========================================

/**
 * Toggle resume visibility validation
 */
exports.toggleVisibilitySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    isPublic: z.boolean(),
  }),
});
