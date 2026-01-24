/**
 * @file Resume.js
 * @description Resume Model with optimized structure and validation
 * @module models/Resume
 * @author Nozibul Islam
 * @version 2.0.0
 * @updated Fixed data type mismatches, optimized indexes, enhanced validation
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ============================================
// CONSTANTS
// ============================================

const LIMITS = {
  MAX_WORK_EXPERIENCES: 50,
  MAX_PROJECTS: 30,
  MAX_EDUCATIONS: 10,
  MAX_CERTIFICATIONS: 30,
  MAX_ACHIEVEMENTS: 30,
  MAX_LANGUAGES: 20,
  MAX_CP_PLATFORMS: 10,
  MAX_RESPONSIBILITIES: 20,
  MAX_HIGHLIGHTS: 10,
  MAX_TECHNOLOGIES: 30,
  MAX_BADGES: 20,
  MAX_SKILLS_PER_CATEGORY: 20,
};

// ============================================
// SUB-SCHEMAS
// ============================================

/**
 * Personal Information Schema
 * FIXED: Matches validation schema requirements
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
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      index: true, // For faster user lookups
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },

    // Social/Professional Links
    linkedin: { type: String, trim: true, default: '' },
    github: { type: String, trim: true, default: '' },
    portfolio: { type: String, trim: true, default: '' },
    leetcode: { type: String, trim: true, default: '' },

    // Optional photo
    photoUrl: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

/**
 * Professional Summary Schema
 * FIXED: Increased maxlength to match validation (2000)
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
 * FIXED: Made date fields required to match validation
 */
const workExperienceSchema = new Schema(
  {
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: {
      month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
      },
      year: {
        type: Number,
        required: true,
        min: 1950,
        max: 2100,
      },
    },
    endDate: {
      month: {
        type: Number,
        min: 1,
        max: 12,
      },
      year: {
        type: Number,
        min: 1950,
        max: 2100,
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
      min: 0,
    },
  },
  { _id: true, timestamps: false }
);

/**
 * Project Schema
 * FIXED: Increased description maxlength to 1000, added technologies limit
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
    },
    sourceCode: {
      type: String,
      trim: true,
      default: '',
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
      min: 0,
    },
  },
  { _id: true, timestamps: false }
);

/**
 * Education Schema
 * FIXED: Made graduationDate fields required, added GPA validation
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
    },
    graduationDate: {
      month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
      },
      year: {
        type: Number,
        required: true,
        min: 1950,
        max: 2100,
      },
    },
    gpa: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (val) {
          if (!val) return true; // Optional field

          return /^[0-4](\.\d{1,2})?$/.test(val);
        },
        message: 'GPA must be a number between 0 and 4 (e.g., 3.75)',
      },
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true, timestamps: false }
);

/**
 * Skills Schema
 * Enhanced with category limits
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
        validator: (arr) => arr.length <= 15,
        message: 'Maximum 15 database skills allowed',
      },
    },
    devOps: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 15,
        message: 'Maximum 15 DevOps skills allowed',
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
 * FIXED: problemsSolved changed to Number, badges changed to [String]
 */
const competitiveProgrammingSchema = new Schema(
  {
    platform: {
      type: String,
      required: [true, 'Platform name is required'],
      trim: true,
      maxlength: [50, 'Platform name cannot exceed 50 characters'],
    },
    problemsSolved: { type: String, trim: true, default: '' },
    badges: { type: String, trim: true, default: '' },
    profileUrl: { type: String, trim: true, default: '' },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    order: { type: Number, default: 0, min: 0 },
  },
  { _id: true, timestamps: false }
);

/**
 * Certification Schema
 * FIXED: Made issueDate fields required
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
        required: true,
        min: 1,
        max: 12,
      },
      year: {
        type: Number,
        required: true,
        min: 1950,
        max: 2100,
      },
    },
    credentialUrl: {
      type: String,
      trim: true,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
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
        min: 1,
        max: 12,
      },
      year: {
        type: Number,
        min: 1950,
        max: 2100,
      },
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true, timestamps: false }
);

/**
 * Customization Settings Schema
 */
const customizationSchema = new Schema(
  {
    namePosition: {
      type: String,
      enum: {
        values: ['left', 'center', 'right'],
        message: '{VALUE} is not a valid name position',
      },
      default: 'center',
    },
    nameCase: {
      type: String,
      enum: {
        values: ['uppercase', 'capitalize', 'normal'],
        message: '{VALUE} is not a valid name case',
      },
      default: 'uppercase',
    },
    colorScheme: {
      type: String,
      default: '#000000',
      validate: {
        validator: (val) => /^#[0-9A-Fa-f]{6}$/.test(val),
        message: 'Color scheme must be a valid hex color (e.g., #000000)',
      },
    },
    fontFamily: {
      type: String,
      default: 'Arial',
      trim: true,
    },
    sectionTitles: {
      type: Map,
      of: String,
      default: new Map(),
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
      index: true,
    },

    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: [true, 'Template ID is required'],
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Resume title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: 'My Resume',
    },

    // Resume Data
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

    languages: {
      type: [languageSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_LANGUAGES,
        message: `Maximum ${LIMITS.MAX_LANGUAGES} languages allowed`,
      },
    },

    achievements: {
      type: [achievementSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= LIMITS.MAX_ACHIEVEMENTS,
        message: `Maximum ${LIMITS.MAX_ACHIEVEMENTS} achievements allowed`,
      },
    },

    // Section visibility and order
    sectionOrder: {
      type: [String],
      default: [
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
    },

    sectionVisibility: {
      type: Map,
      of: Boolean,
      default: new Map([
        ['personalInfo', true],
        ['summary', true],
        ['skills', true],
        ['workExperience', true],
        ['projects', true],
        ['education', true],
        ['certifications', false],
        ['competitiveProgramming', false],
        ['achievements', false],
        ['languages', false],
      ]),
    },

    // User customization
    customization: {
      type: customizationSchema,
      default: () => ({
        namePosition: 'center',
        nameCase: 'uppercase',
        colorScheme: '#000000',
        fontFamily: 'Arial',
        sectionTitles: new Map(),
      }),
    },

    // Completion tracking
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

// Compound index for common queries
resumeSchema.index({ userId: 1, isActive: 1, updatedAt: -1 });

// For template-based queries
resumeSchema.index({ userId: 1, templateId: 1 });

// For sorting by creation date
resumeSchema.index({ createdAt: -1 });

// Sparse index for email lookups (optional optimization)
resumeSchema.index({ 'personalInfo.email': 1 }, { sparse: true });

// ============================================
// VIRTUALS
// ============================================

/**
 * Check if resume is complete
 */
resumeSchema.virtual('isComplete').get(function () {
  return this.completionPercentage === 100;
});

/**
 * Get total sections count
 */
resumeSchema.virtual('totalSections').get(function () {
  return this.sectionOrder?.length || 0;
});

/**
 * Get visible sections count
 */
resumeSchema.virtual('visibleSections').get(function () {
  if (!this.sectionVisibility) return 0;
  return Array.from(this.sectionVisibility.values()).filter(Boolean).length;
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Calculate completion percentage based on required fields
 * Enhanced with more accurate scoring
 */
resumeSchema.methods.calculateCompletion = function () {
  let totalFields = 0;
  let filledFields = 0;

  // Personal Info (required fields - 4 points)
  totalFields += 4;
  if (this.personalInfo?.fullName?.trim()) filledFields++;
  if (this.personalInfo?.jobTitle?.trim()) filledFields++;
  if (this.personalInfo?.email?.trim()) filledFields++;
  if (this.personalInfo?.phone?.trim()) filledFields++;

  // Summary (1 point)
  totalFields += 1;
  if (this.summary?.text?.trim() && this.summary.text.length > 20) {
    filledFields++;
  }

  // Work Experience (1 point for at least 1)
  totalFields += 1;
  if (this.workExperience?.length > 0) filledFields++;

  // Education (1 point for at least 1)
  totalFields += 1;
  if (this.education?.length > 0) filledFields++;

  // Skills (1 point for at least 3 total skills)
  totalFields += 1;
  if (this.skills) {
    const totalSkills = Object.values(this.skills.toObject())
      .flat()
      .filter((skill) => skill?.trim()).length;
    if (totalSkills >= 3) filledFields++;
  }

  // Projects (1 point for at least 1) - BONUS
  totalFields += 1;
  if (this.projects?.length > 0) filledFields++;

  this.completionPercentage = Math.round((filledFields / totalFields) * 100);
  return this.completionPercentage;
};

/**
 * Soft delete resume
 */
resumeSchema.methods.softDelete = async function () {
  this.isActive = false;
  return this.save();
};

/**
 * Restore soft-deleted resume
 */
resumeSchema.methods.restore = async function () {
  this.isActive = true;
  return this.save();
};

/**
 * Create a duplicate of this resume
 */
resumeSchema.methods.duplicate = async function (userId, newTitle) {
  const Resume = this.constructor;

  const duplicateData = this.toObject();
  delete duplicateData._id;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;
  delete duplicateData.__v;

  duplicateData.userId = userId || this.userId;
  duplicateData.title = newTitle || `${this.title} (Copy)`;

  const duplicate = new Resume(duplicateData);
  return duplicate.save();
};

/**
 * Get resume summary stats
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
    totalSkills: this.skills
      ? Object.values(this.skills.toObject())
          .flat()
          .filter((s) => s?.trim()).length
      : 0,
  };
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Get user's active resumes with optimized query
 */
resumeSchema.statics.getUserResumes = function (userId, options = {}) {
  const { limit = 10, sort = '-updatedAt', populate = true } = options;

  const query = this.find({ userId, isActive: true });

  if (populate) {
    query.populate('templateId', 'name category thumbnailUrl');
  }

  return query.sort(sort).limit(limit).select('-__v').lean(); // Use lean for better performance
};

/**
 * Get resume with template details
 */
resumeSchema.statics.getResumeWithTemplate = function (resumeId, userId) {
  return this.findOne({ _id: resumeId, userId, isActive: true })
    .populate('templateId')
    .select('-__v')
    .lean();
};

/**
 * Get resume by ID (with ownership check)
 */
resumeSchema.statics.getByIdAndUser = function (resumeId, userId) {
  return this.findOne({ _id: resumeId, userId, isActive: true }).select('-__v');
};

/**
 * Count user's resumes
 */
resumeSchema.statics.countUserResumes = function (userId) {
  return this.countDocuments({ userId, isActive: true });
};

/**
 * Bulk soft delete
 */
resumeSchema.statics.bulkSoftDelete = function (resumeIds, userId) {
  return this.updateMany(
    { _id: { $in: resumeIds }, userId },
    { isActive: false, updatedAt: new Date() }
  );
};

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Calculate completion before save
 */
resumeSchema.pre('save', function (next) {
  if (this.isModified() || this.isNew) {
    this.calculateCompletion();
  }
  next();
});

/**
 * Validate section order uniqueness
 */
resumeSchema.pre('save', function (next) {
  if (this.sectionOrder?.length) {
    const uniqueSections = new Set(this.sectionOrder);
    if (uniqueSections.size !== this.sectionOrder.length) {
      return next(new Error('Section order contains duplicates'));
    }
  }
  next();
});

/**
 * Validate work experience dates
 */
resumeSchema.pre('save', function (next) {
  if (!this.workExperience?.length) return next();

  for (const exp of this.workExperience) {
    // Check if currently working but has end date
    if (exp.currentlyWorking && exp.endDate) {
      return next(
        new Error('Work experience cannot have end date when currently working')
      );
    }

    // Check if not working but missing end date
    if (!exp.currentlyWorking && !exp.endDate) {
      return next(
        new Error(
          'Work experience must have end date when not currently working'
        )
      );
    }

    // Check if end date is after start date
    if (exp.endDate && exp.startDate) {
      const startTotal = exp.startDate.year * 12 + exp.startDate.month;
      const endTotal = exp.endDate.year * 12 + exp.endDate.month;

      if (endTotal < startTotal) {
        return next(
          new Error('Work experience end date must be same or after start date')
        );
      }
    }
  }

  next();
});

/**
 * Ensure default values for Maps
 */
resumeSchema.pre('save', function (next) {
  if (!this.sectionVisibility || !(this.sectionVisibility instanceof Map)) {
    this.sectionVisibility = new Map([
      ['personalInfo', true],
      ['summary', true],
      ['skills', true],
      ['workExperience', true],
      ['projects', true],
      ['education', true],
      ['certifications', false],
      ['competitiveProgramming', false],
      ['achievements', false],
      ['languages', false],
    ]);
  }

  if (
    !this.customization?.sectionTitles ||
    !(this.customization.sectionTitles instanceof Map)
  ) {
    if (!this.customization) {
      this.customization = {};
    }
    this.customization.sectionTitles = new Map();
  }

  next();
});

// ============================================
// QUERY HELPERS
// ============================================

/**
 * Helper to find only active resumes
 */
resumeSchema.query.active = function () {
  return this.where({ isActive: true });
};

/**
 * Helper to find by user
 */
resumeSchema.query.byUser = function (userId) {
  return this.where({ userId });
};

/**
 * Helper to populate template
 */
resumeSchema.query.withTemplate = function () {
  return this.populate('templateId', 'name category thumbnailUrl');
};

// ============================================
// EXPORT
// ============================================

module.exports = mongoose.model('Resume', resumeSchema);
