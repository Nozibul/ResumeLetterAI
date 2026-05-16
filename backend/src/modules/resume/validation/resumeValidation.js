/**
 * @file resumeValidation.js
 * @description Zod validation schemas for all resume API operations
 * @module modules/resume/validation/resumeValidation
 * @author Nozibul Islam
 * @version 5.0.0
 * @updated
 *   v5.0.0 — Final clean version:
 *   - LIMITS synced with current model (achievements/languages removed from model)
 *   - gpaScale removed — only 4.0 scale supported (5-point scale does not exist in practice)
 *   - gpa: format + range validated in one refine via parseFloat (no regex shortcut)
 *   - achievements and languages removed from all schemas
 *   - sectionVisibility: only 8 core sections, no .partial() (was a no-op)
 *   - endDateSchema: if year present, month required (prevents NaN in model middleware)
 *   - nonEmptyStringArray: .default([]) moved into helper — no repetition at call sites
 *   - getUserResumesQuerySchema: z.number() instead of string parse + transform
 *   - updateSectionOrderSchema: max driven by VALID_SECTIONS.length, not a magic number
 *   - pdfUrl / pdfPublicId removed from updateResumeSchema (not in model)
 *   - personalInfo: location/company maxlengths added to match model
 *   - competitiveProgrammingSchema: problemsSolved max(20) added to match model
 *   - email domain blocklist removed (fragile; use a dedicated library if needed)
 *   - workExperienceSchema: jobTitle/company maxlengths added to match model
 */

const { z } = require('zod');

// ============================================================
// CONSTANTS — keep in sync with Resume model LIMITS
// ============================================================

const LIMITS = {
  MAX_WORK_EXPERIENCES: 5,
  MAX_PROJECTS: 5,
  MAX_EDUCATIONS: 5,
  MAX_CERTIFICATIONS: 5,
  MAX_CP_PLATFORMS: 10,
  MAX_RESPONSIBILITIES: 10,
  MAX_HIGHLIGHTS: 5,
  MAX_TECHNOLOGIES: 20,
  MAX_BADGES: 10,
  MAX_SKILLS_PER_CATEGORY: 15,
  MAX_SKILLS_DB_DEVOPS: 15,
  MAX_RESUMES_PER_FETCH: 50,
  MIN_SKILLS_FOR_COMPLETION: 3, // informational — not used in validation logic
  SUMMARY_MAX_LENGTH: 2000,
  TITLE_MAX_LENGTH: 100,
};

// Single source of truth for all valid section names.
// sectionNameSchema, sectionVisibilitySchema, and updateSectionOrderSchema
// all derive from this — they can never drift apart.
const VALID_SECTIONS = [
  'personalInfo',
  'summary',
  'workExperience',
  'projects',
  'skills',
  'education',
  'competitiveProgramming',
  'certifications',
];

// ============================================================
// SHARED PRIMITIVE SCHEMAS
// ============================================================

const sectionNameSchema = z.enum(VALID_SECTIONS, {
  errorMap: () => ({ message: 'Invalid section name' }),
});

// All fields optional — .partial() was previously used here but is a no-op
// when every field is already .optional(), so it has been removed.
const sectionVisibilitySchema = z.object({
  personalInfo: z.boolean().optional(),
  summary: z.boolean().optional(),
  workExperience: z.boolean().optional(),
  projects: z.boolean().optional(),
  skills: z.boolean().optional(),
  education: z.boolean().optional(),
  competitiveProgramming: z.boolean().optional(),
  certifications: z.boolean().optional(),
});

const objectIdSchema = z
  .string()
  .trim()
  .length(24, 'ID must be exactly 24 characters')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format');

// Accepts a valid http/https URL, empty string, or null/undefined.
const urlOrEmpty = z
  .string()
  .trim()
  .nullable()
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const { protocol } = new URL(val);
        return protocol === 'http:' || protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Must be a valid HTTP/HTTPS URL' }
  )
  .optional()
  .default('');

// year min 1950 matches the model schema constraint (previously was min(1)).
const completeDateSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(1950).max(2100),
});

// endDate is optional as a whole, but year and month must appear together.
// This mirrors the model pre-save middleware check that prevents NaN arithmetic:
//   const endTotal = exp.endDate.year * 12 + exp.endDate.month;
// If month is undefined, endTotal becomes NaN and the comparison silently passes.
const endDateSchema = z
  .object({
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(1950).max(2100).optional(),
  })
  .refine(
    (d) => {
      const hasYear = d.year !== undefined;
      const hasMonth = d.month !== undefined;
      return hasYear === hasMonth; // both present or both absent
    },
    { message: 'End date must include both month and year, or neither' }
  )
  .nullable()
  .optional();

// .default([]) lives here so every call site stays clean.
const nonEmptyStringArray = (max) =>
  z
    .array(z.string().trim().min(1, 'Value cannot be empty'))
    .max(max)
    .default([]);

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color (e.g. #0066CC)');

// ============================================================
// SECTION SCHEMAS
// ============================================================

const personalInfoSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  jobTitle: z.string().trim().min(1, 'Job title is required').max(100),
  email: z.string().trim().toLowerCase().email('Invalid email format'),
  // NOTE: if disposable-email blocking is needed, use a dedicated library
  // (e.g. disposable-email-domains). A hardcoded domain blocklist is fragile
  // and can reject legitimate addresses.
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Phone number contains invalid characters')
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
      },
      { message: 'Phone must contain 10–15 digits' }
    ),
  location: z.string().trim().max(150).optional().default(''),
  linkedin: urlOrEmpty,
  github: urlOrEmpty,
  portfolio: urlOrEmpty,
  leetcode: urlOrEmpty,
  photoUrl: urlOrEmpty,
});

const summarySchema = z
  .object({
    text: z
      .string()
      .trim()
      .max(LIMITS.SUMMARY_MAX_LENGTH)
      .optional()
      .default(''),
    isVisible: z.boolean().default(true),
  })
  .optional()
  .default({ text: '', isVisible: true });

const workExperienceSchema = z
  .object({
    _id: objectIdSchema.optional(),
    jobTitle: z.string().trim().min(1, 'Job title is required').max(100),
    company: z.string().trim().min(1, 'Company name is required').max(150),
    location: z.string().trim().max(150).optional().default(''),
    startDate: completeDateSchema,
    endDate: endDateSchema,
    currentlyWorking: z.boolean().default(false),
    responsibilities: nonEmptyStringArray(LIMITS.MAX_RESPONSIBILITIES),
    order: z.number().int().min(0).default(0),
  })
  .refine(
    (d) => {
      if (d.currentlyWorking && d.endDate?.year) return false; // working but has end date
      if (!d.currentlyWorking && !d.endDate?.year) return false; // not working, no end date
      return true;
    },
    {
      message:
        'Provide an end date when not currently working; remove end date when currently working',
      path: ['endDate'],
    }
  )
  .refine(
    (d) => {
      if (!d.endDate?.year || d.currentlyWorking) return true;
      const start = d.startDate.year * 12 + d.startDate.month;
      const end = d.endDate.year * 12 + d.endDate.month;
      return end >= start;
    },
    {
      message: 'End date must be the same as or after start date',
      path: ['endDate'],
    }
  );

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

// gpa: plain numeric string, 0.00–4.00, max 2 decimal places.
// gpaScale field removed — 5-point scale does not exist in practice.
// One refine does both format and range checks, mirroring the model's isValidGpa helper.
const educationSchema = z.object({
  _id: objectIdSchema.optional(),
  degree: z.string().trim().min(1, 'Degree is required').max(150),
  institution: z.string().trim().min(1, 'Institution is required').max(200),
  location: z.string().trim().max(150).optional().default(''),
  graduationDate: completeDateSchema,
  gpa: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        if (!/^\d+(\.\d{1,2})?$/.test(val)) return false;
        const num = parseFloat(val);
        return num >= 0 && num <= 4.0;
      },
      {
        message:
          'GPA must be a number between 0.00 and 4.00 with up to 2 decimal places ' +
          '(e.g. 3.75). Text like "3.75/4" or "First Class" is not accepted.',
      }
    )
    .optional()
    .default(''),
  order: z.number().int().min(0).default(0),
});

const skillsSchema = z
  .object({
    programmingLanguages: nonEmptyStringArray(LIMITS.MAX_SKILLS_PER_CATEGORY),
    frontend: nonEmptyStringArray(LIMITS.MAX_SKILLS_PER_CATEGORY),
    backend: nonEmptyStringArray(LIMITS.MAX_SKILLS_PER_CATEGORY),
    database: nonEmptyStringArray(LIMITS.MAX_SKILLS_DB_DEVOPS),
    devOps: nonEmptyStringArray(LIMITS.MAX_SKILLS_DB_DEVOPS),
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

const competitiveProgrammingSchema = z.object({
  _id: objectIdSchema.optional(),
  platform: z.string().trim().min(1, 'Platform name is required').max(50),
  handle: z.string().trim().max(100).optional().default(''),
  problemsSolved: z.string().trim().max(20).optional().default(''),
  badges: z.array(z.string().trim().min(1)).max(LIMITS.MAX_BADGES).default([]),
  profileUrl: urlOrEmpty,
  description: z.string().trim().max(500).optional().default(''),
  order: z.number().int().min(0).default(0),
});

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

// ============================================================
// CUSTOMIZATION SCHEMA
// ============================================================

// Reusable partial version for PATCH updates (all fields optional).
const customizationPartialSchema = z
  .object({
    colors: z
      .object({
        primary: hexColor.optional(),
        secondary: hexColor.optional(),
        accent: hexColor.optional(),
      })
      .optional(),
    fonts: z
      .object({
        heading: z.string().trim().optional(),
        body: z.string().trim().optional(),
        italic: z.boolean().optional(),
      })
      .optional(),
    nameStyle: z
      .object({
        position: z.enum(['left', 'center', 'right']).optional(),
        case: z.enum(['uppercase', 'capitalize', 'normal']).optional(),
        bold: z.boolean().optional(),
      })
      .optional(),
    sectionHeadingStyle: z
      .object({
        position: z.enum(['left', 'center', 'right']).optional(),
        case: z.enum(['uppercase', 'capitalize', 'normal']).optional(),
        fontWeight: z.string().trim().optional(),
        borderStyle: z.string().trim().optional(),
      })
      .optional(),
  })
  .optional();

// Full version with defaults for CREATE.
const customizationFullSchema = z
  .object({
    colors: z
      .object({
        primary: hexColor.default('#000000'),
        secondary: hexColor.default('#333333'),
        accent: hexColor.default('#0066CC'),
      })
      .optional()
      .default({ primary: '#000000', secondary: '#333333', accent: '#0066CC' }),
    fonts: z
      .object({
        heading: z.string().trim().default('Arial'),
        body: z.string().trim().default('Arial'),
        italic: z.boolean().default(false),
      })
      .optional()
      .default({ heading: 'Arial', body: 'Arial', italic: false }),
    nameStyle: z
      .object({
        position: z.enum(['left', 'center', 'right']).default('center'),
        case: z
          .enum(['uppercase', 'capitalize', 'normal'])
          .default('uppercase'),
        bold: z.boolean().default(true),
      })
      .optional()
      .default({ position: 'center', case: 'uppercase', bold: true }),
    sectionHeadingStyle: z
      .object({
        position: z.enum(['left', 'center', 'right']).default('left'),
        case: z
          .enum(['uppercase', 'capitalize', 'normal'])
          .default('uppercase'),
        fontWeight: z.string().trim().default('bold'),
        borderStyle: z.string().trim().default('bottom'),
      })
      .optional()
      .default({
        position: 'left',
        case: 'uppercase',
        fontWeight: 'bold',
        borderStyle: 'bottom',
      }),
  })
  .optional()
  .default({});

// ============================================================
// EXPORTED VALIDATION SCHEMAS
// ============================================================

exports.createResumeSchema = z.object({
  body: z.object({
    templateId: objectIdSchema,
    title: z
      .string()
      .trim()
      .min(1)
      .max(LIMITS.TITLE_MAX_LENGTH)
      .default('My Resume'),
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
    sectionOrder: z.array(sectionNameSchema).optional().default([]),
    sectionVisibility: sectionVisibilitySchema.optional().default({}),
    customization: customizationFullSchema,
  }),
});

exports.updateResumeSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      title: z.string().trim().min(1).max(LIMITS.TITLE_MAX_LENGTH).optional(),
      personalInfo: personalInfoSchema.optional(),
      summary: z
        .object({
          text: z.string().trim().max(LIMITS.SUMMARY_MAX_LENGTH).optional(),
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
          database: nonEmptyStringArray(LIMITS.MAX_SKILLS_DB_DEVOPS).optional(),
          devOps: nonEmptyStringArray(LIMITS.MAX_SKILLS_DB_DEVOPS).optional(),
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
      sectionOrder: z.array(sectionNameSchema).optional(),
      sectionVisibility: sectionVisibilitySchema.optional(),
      customization: customizationPartialSchema,
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

exports.getResumeByIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

exports.deleteResumeSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

exports.duplicateResumeSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      title: z.string().trim().min(1).max(LIMITS.TITLE_MAX_LENGTH).optional(),
    })
    .optional()
    .default({}),
});

// limit is z.number() directly — cleaner than parsing a query string and
// avoids the string-default vs .transform() edge case from previous versions.
exports.getUserResumesQuerySchema = z.object({
  query: z
    .object({
      limit: z.coerce
        .number()
        .int()
        .min(1, 'Limit must be at least 1')
        .max(
          LIMITS.MAX_RESUMES_PER_FETCH,
          `Limit cannot exceed ${LIMITS.MAX_RESUMES_PER_FETCH}`
        )
        .optional()
        .default(10),
      sort: z.enum(['newest', 'oldest', 'title']).optional().default('newest'),
    })
    .optional()
    .default({ limit: 10, sort: 'newest' }),
});

exports.updateSectionOrderSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    sectionOrder: z
      .array(sectionNameSchema)
      .min(1, 'At least one section is required')
      .max(
        VALID_SECTIONS.length,
        `Maximum ${VALID_SECTIONS.length} sections allowed`
      )
      .refine((arr) => new Set(arr).size === arr.length, {
        message: 'Duplicate sections are not allowed',
      }),
  }),
});

exports.updateSectionVisibilitySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    sectionVisibility: sectionVisibilitySchema.refine(
      (obj) => Object.keys(obj).length > 0,
      { message: 'At least one section visibility field must be provided' }
    ),
  }),
});

exports.switchTemplateSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    templateId: objectIdSchema,
  }),
});
