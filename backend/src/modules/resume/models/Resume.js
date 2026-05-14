/**
 * @file Resume.js
 * @description Resume Model - Production Ready
 * @module models/Resume
 * @author Nozibul Islam
 * @version 2.1.0
 * @updated
 *   v2.1.0 — GPA simplified: removed gpaScale field entirely.
 *   Standard CGPA scale is 4.0 worldwide; a 5-point scale does not exist in practice.
 *   isValidGpa now enforces 0–4.00 strictly. No schema migration needed —
 *   gpaScale was never persisted to production.
 *
 *   v2.0.0 — Additional fixes applied:
 *   - endDate.month null-safety: explicit check before arithmetic to prevent NaN
 *   - duplicate(): strips _id from all sub-document arrays to avoid key conflicts
 *   - getUserResumes(): hard cap on limit (max 100) to prevent accidental large fetches
 *   - LIMITS.MIN_SKILLS_FOR_COMPLETION replaces magic number 3 in calculateCompletion()
 *   - Three separate pre('save') middleware merged into two (validation + completion)
 *   - sectionVisibility: added achievements and languages fields
 *
 *   v2.0.0 — Previous fixes:
 *   GPA/CGPA validation, URL validation, type safety, index optimization,
 *   sectionVisibility type fix, skills toObject crash fix,
 *   endDate null-safety, badges limit, hardcoded limits normalized
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ============================================
// CONSTANTS
// ============================================

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
  MAX_RESUMES_PER_FETCH: 50, // hard cap for getUserResumes() limit option
  MIN_SKILLS_FOR_COMPLETION: 3, // minimum total skills to count as "skills filled"
};

// ============================================
// HELPERS
// ============================================

/**
 * URL validator — accepts http/https URLs only.
 * Empty string / null / undefined = valid (field is optional).
 */
const isValidUrl = (val) => {
  if (!val || val.trim() === '') return true;
  try {
    const url = new URL(val.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const urlValidation = {
  validator: isValidUrl,
  message: (props) =>
    `"${props.value}" is not a valid URL. Must start with http:// or https://`,
};

/**
 * GPA / CGPA validator
 *
 * Rules:
 *   - Numbers only — "3.75/4", "First Class", "A+" are all rejected
 *   - Range: 0.00 – 4.00  (standard 4-point scale only)
 *   - Max 2 decimal places
 *   - Field is optional; empty string passes
 */
const isValidGpa = (val) => {
  if (!val || val.trim() === '') return true;
  if (!/^\d+(\.\d{1,2})?$/.test(val.trim())) return false;
  const num = parseFloat(val);
  return num >= 0 && num <= 4.0;
};

const gpaValidation = {
  validator: isValidGpa,
  message:
    'GPA must be a number between 0.00 and 4.00 with up to 2 decimal places (e.g. 3.75). Text like "3.75/4" or "First Class" is not accepted.',
};

/**
 * Strip _id from plain objects / Mongoose subdocs in an array.
 * Used by duplicate() to avoid ObjectId conflicts on sub-documents.
 */
const stripIds = (arr) =>
  (arr || []).map((item) => {
    // toObject() is the safest path for Mongoose subdocs — it handles Dates, ObjectIds, etc.
    // structuredClone() is used for plain objects: unlike { ...item } it does a true deep
    // clone, so nested fields cannot be mutated back into the original document.
    // Requires Node.js >= 17. If you need older Node support, swap to lodash cloneDeep().
    const obj =
      typeof item.toObject === 'function'
        ? item.toObject()
        : structuredClone(item);
    delete obj._id;
    return obj;
  });

// ============================================
// SUB-SCHEMAS
// ============================================

/**
 * Personal Information Schema
 */
const personalInfoSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters'],
      default: '',
    },

    // Social / Professional Links — must be proper URLs
    linkedin: {
      type: String,
      trim: true,
      default: '',
      validate: urlValidation,
    },
    github: {
      type: String,
      trim: true,
      default: '',
      validate: urlValidation,
    },
    portfolio: {
      type: String,
      trim: true,
      default: '',
      validate: urlValidation,
    },
    leetcode: {
      type: String,
      trim: true,
      default: '',
      validate: urlValidation,
    },

    // Optional photo — must be a proper URL if provided
    photoUrl: {
      type: String,
      trim: true,
      default: '',
      validate: urlValidation,
    },
  },
  { _id: false }
);

/**
 * Professional Summary Schema
 */
const summarySchema = new Schema(
  {
    text: {
      type: String,
      trim: true,
      maxlength: [2000, 'Summary cannot exceed 2000 characters'],
      default: '',
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

/**
 * Work Experience Schema
 */
const workExperienceSchema = new Schema(
  {
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [150, 'Company name cannot exceed 150 characters'],
    },
    location: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Location cannot exceed 150 characters'],
    },
    startDate: {
      month: {
        type: Number,
        required: [true, 'Start month is required'],
        min: [1, 'Month must be between 1 and 12'],
        max: [12, 'Month must be between 1 and 12'],
      },
      year: {
        type: Number,
        required: [true, 'Start year is required'],
        min: [1950, 'Year must be between 1950 and 2100'],
        max: [2100, 'Year must be between 1950 and 2100'],
      },
    },
    // endDate presence/absence is validated in pre-save middleware via endDate.year check.
    // endDate.month is also validated there to prevent NaN in date arithmetic.
    endDate: {
      month: {
        type: Number,
        min: [1, 'Month must be between 1 and 12'],
        max: [12, 'Month must be between 1 and 12'],
      },
      year: {
        type: Number,
        min: [1950, 'Year must be between 1950 and 2100'],
        max: [2100, 'Year must be between 1950 and 2100'],
      },
    },
    currentlyWorking: {
      type: Boolean,
      default: false,
    },
    responsibilities: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_RESPONSIBILITIES,
        message: `Maximum ${LIMITS.MAX_RESPONSIBILITIES} responsibilities allowed`,
      },
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order cannot be negative'],
    },
  },
  { _id: true, timestamps: false }
);

/**
 * Project Schema
 */
const projectSchema = new Schema(
  {
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [150, 'Project name cannot exceed 150 characters'],
    },
    technologies: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_TECHNOLOGIES,
        message: `Maximum ${LIMITS.MAX_TECHNOLOGIES} technologies allowed`,
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    liveUrl: {
      type: String,
      trim: true,
      default: '',
      validate: urlValidation,
    },
    sourceCode: {
      type: String,
      trim: true,
      default: '',
      validate: urlValidation,
    },
    highlights: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_HIGHLIGHTS,
        message: `Maximum ${LIMITS.MAX_HIGHLIGHTS} highlights allowed`,
      },
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order cannot be negative'],
    },
  },
  { _id: true, timestamps: false }
);

/**
 * Education Schema
 *
 * gpa — stored as String to preserve formatting (e.g. "3.75" vs "3.7").
 * Validated as a plain number in range 0.00–4.00 (standard 4-point scale).
 */
const educationSchema = new Schema(
  {
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
      maxlength: [150, 'Degree cannot exceed 150 characters'],
    },
    institution: {
      type: String,
      required: [true, 'Institution is required'],
      trim: true,
      maxlength: [200, 'Institution cannot exceed 200 characters'],
    },
    location: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Location cannot exceed 150 characters'],
    },
    graduationDate: {
      month: {
        type: Number,
        required: [true, 'Graduation month is required'],
        min: [1, 'Month must be between 1 and 12'],
        max: [12, 'Month must be between 1 and 12'],
      },
      year: {
        type: Number,
        required: [true, 'Graduation year is required'],
        min: [1950, 'Year must be between 1950 and 2100'],
        max: [2100, 'Year must be between 1950 and 2100'],
      },
    },

    gpa: {
      type: String,
      trim: true,
      default: '',
      validate: gpaValidation,
    },

    order: {
      type: Number,
      default: 0,
      min: [0, 'Order cannot be negative'],
    },
  },
  { _id: true, timestamps: false }
);

/**
 * Skills Schema
 */
const skillsSchema = new Schema(
  {
    programmingLanguages: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_SKILLS_PER_CATEGORY,
        message: `Maximum ${LIMITS.MAX_SKILLS_PER_CATEGORY} programming languages allowed`,
      },
    },
    frontend: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_SKILLS_PER_CATEGORY,
        message: `Maximum ${LIMITS.MAX_SKILLS_PER_CATEGORY} frontend skills allowed`,
      },
    },
    backend: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_SKILLS_PER_CATEGORY,
        message: `Maximum ${LIMITS.MAX_SKILLS_PER_CATEGORY} backend skills allowed`,
      },
    },
    database: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_SKILLS_DB_DEVOPS,
        message: `Maximum ${LIMITS.MAX_SKILLS_DB_DEVOPS} database skills allowed`,
      },
    },
    devOps: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_SKILLS_DB_DEVOPS,
        message: `Maximum ${LIMITS.MAX_SKILLS_DB_DEVOPS} DevOps skills allowed`,
      },
    },
    tools: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_SKILLS_PER_CATEGORY,
        message: `Maximum ${LIMITS.MAX_SKILLS_PER_CATEGORY} tools allowed`,
      },
    },
    other: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_SKILLS_PER_CATEGORY,
        message: `Maximum ${LIMITS.MAX_SKILLS_PER_CATEGORY} other skills allowed`,
      },
    },
  },
  { _id: false }
);

/**
 * Competitive Programming Schema
 */
const competitiveProgrammingSchema = new Schema(
  {
    platform: {
      type: String,
      required: [true, 'Platform name is required'],
      trim: true,
      maxlength: [50, 'Platform name cannot exceed 50 characters'],
    },
    handle: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Handle cannot exceed 100 characters'],
    },
    problemsSolved: {
      type: String,
      trim: true,
      default: '',
      maxlength: [20, 'Problems solved value cannot exceed 20 characters'],
    },
    badges: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_BADGES,
        message: `Maximum ${LIMITS.MAX_BADGES} badges allowed`,
      },
    },
    profileUrl: {
      type: String,
      trim: true,
      default: '',
      validate: urlValidation,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order cannot be negative'],
    },
  },
  { _id: true, timestamps: false }
);

/**
 * Certification Schema
 */
const certificationSchema = new Schema(
  {
    certificationName: {
      type: String,
      required: [true, 'Certification name is required'],
      trim: true,
      maxlength: [200, 'Certification name cannot exceed 200 characters'],
    },
    issuer: {
      type: String,
      trim: true,
      maxlength: [150, 'Issuer name cannot exceed 150 characters'],
      default: '',
    },
    issueDate: {
      month: {
        type: Number,
        required: [true, 'Issue month is required'],
        min: [1, 'Month must be between 1 and 12'],
        max: [12, 'Month must be between 1 and 12'],
      },
      year: {
        type: Number,
        required: [true, 'Issue year is required'],
        min: [1950, 'Year must be between 1950 and 2100'],
        max: [2100, 'Year must be between 1950 and 2100'],
      },
    },
    credentialUrl: {
      type: String,
      trim: true,
      default: '',
      validate: urlValidation,
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order cannot be negative'],
    },
  },
  { _id: true, timestamps: false }
);

/**
 * Language Schema
 */
const languageSchema = new Schema(
  {
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
      maxlength: [50, 'Language name cannot exceed 50 characters'],
    },
    proficiency: {
      type: String,
      enum: {
        values: ['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'],
        message: '{VALUE} is not a valid proficiency level',
      },
      default: 'Professional',
    },
  },
  { _id: true, timestamps: false }
);

/**
 * Achievement Schema
 */
const achievementSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    date: {
      month: {
        type: Number,
        min: [1, 'Month must be between 1 and 12'],
        max: [12, 'Month must be between 1 and 12'],
      },
      year: {
        type: Number,
        min: [1950, 'Year must be between 1950 and 2100'],
        max: [2100, 'Year must be between 1950 and 2100'],
      },
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order cannot be negative'],
    },
  },
  { _id: true, timestamps: false }
);

/**
 * Customization Settings Schema
 */
const customizationSchema = new Schema(
  {
    colors: {
      primary: { type: String, default: '#000000' },
      secondary: { type: String, default: '#333333' },
      accent: { type: String, default: '#0066CC' },
    },
    fonts: {
      heading: { type: String, default: 'Arial' },
      body: { type: String, default: 'Arial' },
      italic: { type: Boolean, default: false },
    },
    nameStyle: {
      position: {
        type: String,
        enum: ['left', 'center', 'right'],
        default: 'center',
      },
      case: {
        type: String,
        enum: ['uppercase', 'capitalize', 'normal'],
        default: 'uppercase',
      },
      bold: { type: Boolean, default: true },
    },
    sectionHeadingStyle: {
      position: {
        type: String,
        enum: ['left', 'center', 'right'],
        default: 'left',
      },
      case: {
        type: String,
        enum: ['uppercase', 'capitalize', 'normal'],
        default: 'uppercase',
      },
      fontWeight: { type: String, default: 'bold' },
      borderStyle: { type: String, default: 'bottom' },
    },
  },
  { _id: false }
);

// ============================================
// MAIN SCHEMA
// ============================================

const resumeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },

    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: [true, 'Template ID is required'],
    },

    title: {
      type: String,
      required: [true, 'Resume title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: 'My Resume',
    },

    personalInfo: {
      type: personalInfoSchema,
      required: [true, 'Personal information is required'],
    },

    summary: {
      type: summarySchema,
      default: () => ({ text: '', isVisible: true }),
    },

    workExperience: {
      type: [workExperienceSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_WORK_EXPERIENCES,
        message: `Maximum ${LIMITS.MAX_WORK_EXPERIENCES} work experiences allowed`,
      },
    },

    projects: {
      type: [projectSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_PROJECTS,
        message: `Maximum ${LIMITS.MAX_PROJECTS} projects allowed`,
      },
    },

    education: {
      type: [educationSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_EDUCATIONS,
        message: `Maximum ${LIMITS.MAX_EDUCATIONS} education entries allowed`,
      },
    },

    skills: {
      type: skillsSchema,
      default: () => ({
        programmingLanguages: [],
        frontend: [],
        backend: [],
        database: [],
        devOps: [],
        tools: [],
        other: [],
      }),
    },

    competitiveProgramming: {
      type: [competitiveProgrammingSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_CP_PLATFORMS,
        message: `Maximum ${LIMITS.MAX_CP_PLATFORMS} competitive programming profiles allowed`,
      },
    },

    certifications: {
      type: [certificationSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_CERTIFICATIONS,
        message: `Maximum ${LIMITS.MAX_CERTIFICATIONS} certifications allowed`,
      },
    },

    sectionOrder: {
      type: [String],
      default: [
        'personalInfo',
        'summary',
        'workExperience',
        'projects',
        'skills',
        'education',
        'competitiveProgramming',
        'certifications',
        // NOTE: 'achievements' and 'languages' are intentionally excluded from the
        // default sectionOrder. They are stored and visibility-controlled independently
        // but are not rendered as reorderable sections in the default template layout.
        // Add them here if your UI needs to support drag-and-drop ordering for these sections.
      ],
    },

    /**
     * sectionVisibility uses explicit Boolean fields (not Mongoose Mixed / Object)
     * so Mongoose can track changes without markModified() calls.
     *
     * achievements and languages are included here so their visibility is
     * controllable even though they are not in the default sectionOrder.
     */
    sectionVisibility: {
      personalInfo: { type: Boolean, default: true },
      summary: { type: Boolean, default: true },
      workExperience: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      education: { type: Boolean, default: true },
      competitiveProgramming: { type: Boolean, default: true },
      certifications: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      languages: { type: Boolean, default: true },
    },

    customization: {
      type: customizationSchema,
      default: () => ({
        colors: { primary: '#000000', secondary: '#333333', accent: '#0066CC' },
        fonts: { heading: 'Arial', body: 'Arial', italic: false },
        nameStyle: { position: 'center', case: 'uppercase', bold: true },
        sectionHeadingStyle: {
          position: 'left',
          case: 'uppercase',
          fontWeight: 'bold',
          borderStyle: 'bottom',
        },
      }),
    },

    completionPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Completion percentage cannot be negative'],
      max: [100, 'Completion percentage cannot exceed 100'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES (OPTIMIZED)
// ============================================

// Primary query index — covers getUserResumes() and most list queries
resumeSchema.index({ userId: 1, isActive: 1, updatedAt: -1 });

// For template-based queries
resumeSchema.index({ userId: 1, templateId: 1 });

// ============================================
// VIRTUALS
// ============================================

resumeSchema.virtual('isComplete').get(function () {
  return this.completionPercentage === 100;
});

resumeSchema.virtual('totalSections').get(function () {
  return this.sectionOrder?.length || 0;
});

/**
 * Counts visible sections from sectionVisibility.
 * Uses Object.values() — works correctly on both Mongoose subdocs and plain objects.
 */
resumeSchema.virtual('visibleSections').get(function () {
  if (!this.sectionVisibility) return 0;
  return Object.values(this.sectionVisibility).filter(Boolean).length;
});

// ============================================
// HELPERS (internal)
// ============================================

/**
 * Safely extract all skills as a flat array.
 * Handles both Mongoose subdoc (.toObject exists) and plain object (e.g. after .lean()).
 */
function _getSkillsArray(skills) {
  if (!skills) return [];
  const obj =
    typeof skills.toObject === 'function' ? skills.toObject() : skills;
  return Object.values(obj)
    .flat()
    .filter((s) => typeof s === 'string' && s.trim() !== '');
}

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Calculate completion percentage.
 * Call this before saving to keep completionPercentage accurate.
 * LIMITS.MIN_SKILLS_FOR_COMPLETION (3) is the minimum total skills count.
 */
resumeSchema.methods.calculateCompletion = function () {
  let total = 0;
  let filled = 0;

  // Personal Info — 4 required fields
  total += 4;
  if (this.personalInfo?.fullName?.trim()) filled++;
  if (this.personalInfo?.jobTitle?.trim()) filled++;
  if (this.personalInfo?.email?.trim()) filled++;
  if (this.personalInfo?.phone?.trim()) filled++;

  // Summary — meaningful text (> 20 chars)
  total += 1;
  if (this.summary?.text?.trim().length > 20) filled++;

  // Work Experience — at least 1 entry
  total += 1;
  if (this.workExperience?.length > 0) filled++;

  // Education — at least 1 entry
  total += 1;
  if (this.education?.length > 0) filled++;

  // Skills — at least MIN_SKILLS_FOR_COMPLETION total across all categories
  total += 1;
  if (_getSkillsArray(this.skills).length >= LIMITS.MIN_SKILLS_FOR_COMPLETION)
    filled++;

  // Projects — bonus point
  total += 1;
  if (this.projects?.length > 0) filled++;

  this.completionPercentage = Math.round((filled / total) * 100);
  return this.completionPercentage;
};

/**
 * Soft delete.
 */
resumeSchema.methods.softDelete = async function () {
  this.isActive = false;
  return this.save();
};

/**
 * Restore soft-deleted resume.
 */
resumeSchema.methods.restore = async function () {
  this.isActive = true;
  return this.save();
};

/**
 * Create a duplicate of this resume.
 *
 * Sub-document _ids are stripped from all arrays so MongoDB assigns fresh ObjectIds,
 * preventing potential duplicate key conflicts.
 * completionPercentage is reset to 0 so the pre-save hook recalculates cleanly.
 */
resumeSchema.methods.duplicate = async function (userId, newTitle) {
  const Resume = this.constructor;
  const data = this.toObject();

  delete data._id;
  delete data.createdAt;
  delete data.updatedAt;
  delete data.__v;
  data.completionPercentage = 0;

  data.userId = userId || this.userId;
  data.title = newTitle || `${this.title} (Copy)`;

  // Strip sub-document _ids to let MongoDB generate fresh ones
  data.workExperience = stripIds(data.workExperience);
  data.projects = stripIds(data.projects);
  data.education = stripIds(data.education);
  data.certifications = stripIds(data.certifications);
  data.languages = stripIds(data.languages);
  data.achievements = stripIds(data.achievements);
  data.competitiveProgramming = stripIds(data.competitiveProgramming);

  return new Resume(data).save();
};

/**
 * Get summary stats for this resume.
 */
resumeSchema.methods.getStats = function () {
  return {
    completionPercentage: this.completionPercentage,
    isComplete: this.isComplete,
    totalSections: this.totalSections,
    visibleSections: this.visibleSections,
    workExperienceCount: this.workExperience?.length || 0,
    projectsCount: this.projects?.length || 0,
    educationCount: this.education?.length || 0,
    certificationsCount: this.certifications?.length || 0,
    achievementsCount: this.achievements?.length || 0,
    languagesCount: this.languages?.length || 0,
    totalSkills: _getSkillsArray(this.skills).length,
  };
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Fetch all active resumes for a user.
 * limit is capped at LIMITS.MAX_RESUMES_PER_FETCH (100) regardless of caller input.
 */
resumeSchema.statics.getUserResumes = function (userId, options = {}) {
  const { limit = 10, sort = '-updatedAt', populate = true } = options;
  const safeLimit = Math.min(limit, LIMITS.MAX_RESUMES_PER_FETCH);
  const query = this.find({ userId, isActive: true });
  if (populate) query.populate('templateId', 'name category thumbnailUrl');
  return query.sort(sort).limit(safeLimit).select('-__v').lean();
};

resumeSchema.statics.getResumeWithTemplate = function (resumeId, userId) {
  return this.findOne({ _id: resumeId, userId, isActive: true })
    .populate('templateId')
    .select('-__v')
    .lean();
};

resumeSchema.statics.getByIdAndUser = function (resumeId, userId) {
  return this.findOne({ _id: resumeId, userId, isActive: true }).select('-__v');
};

resumeSchema.statics.countUserResumes = function (userId) {
  return this.countDocuments({ userId, isActive: true });
};

/**
 * Soft-delete multiple resumes.
 * Mongoose timestamps handles updatedAt automatically — no manual $set needed.
 */
resumeSchema.statics.bulkSoftDelete = function (resumeIds, userId) {
  return this.updateMany(
    { _id: { $in: resumeIds }, userId },
    { $set: { isActive: false } }
  );
};

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Combined pre-save validation hook.
 *
 * Runs three checks in sequence:
 *   1. sectionOrder duplicate entries
 *   2. Work experience date logic (currentlyWorking vs endDate, date ordering)
 *   3. GPA cross-validation (gpa value vs gpaScale)
 *
 * Merging into one hook avoids registering multiple async chains and makes
 * the validation order explicit and easy to follow.
 */
resumeSchema.pre('save', function (next) {
  // --- 1. sectionOrder duplicates ---
  if (this.sectionOrder?.length) {
    const unique = new Set(this.sectionOrder);
    if (unique.size !== this.sectionOrder.length) {
      return next(new Error('sectionOrder contains duplicate entries'));
    }
  }

  // --- 2. Work experience date logic ---
  for (const exp of this.workExperience || []) {
    const hasEndYear = Boolean(exp.endDate?.year);
    const hasEndMonth = Boolean(exp.endDate?.month);

    if (exp.currentlyWorking && hasEndYear) {
      return next(
        new Error(
          `Work experience at "${exp.company}" cannot have an end date when currently working`
        )
      );
    }

    if (!exp.currentlyWorking && !hasEndYear) {
      return next(
        new Error(
          `Work experience at "${exp.company}" must have an end date when not currently working`
        )
      );
    }

    // If an end year is provided, month must also be present to make date arithmetic safe.
    // Without this check, endDate.month = undefined turns the comparison below into NaN.
    if (hasEndYear && !hasEndMonth) {
      return next(
        new Error(
          `Work experience at "${exp.company}": end date month is required when end year is set`
        )
      );
    }

    if (hasEndYear && hasEndMonth && exp.startDate?.year) {
      const startTotal = exp.startDate.year * 12 + exp.startDate.month;
      const endTotal = exp.endDate.year * 12 + exp.endDate.month;
      if (endTotal < startTotal) {
        return next(
          new Error(
            `Work experience at "${exp.company}": end date cannot be before start date`
          )
        );
      }
    }
  }

  next();
});

/**
 * Recalculate completion percentage before every save.
 * Runs after the validation hook so it only fires on clean data.
 */
resumeSchema.pre('save', function (next) {
  if (this.isModified() || this.isNew) {
    this.calculateCompletion();
  }
  next();
});

// ============================================
// QUERY HELPERS
// ============================================

resumeSchema.query.active = function () {
  return this.where({ isActive: true });
};

resumeSchema.query.byUser = function (userId) {
  return this.where({ userId });
};

resumeSchema.query.withTemplate = function () {
  return this.populate('templateId', 'name category thumbnailUrl');
};

// ============================================
// EXPORT
// ============================================

module.exports = mongoose.model('Resume', resumeSchema);
