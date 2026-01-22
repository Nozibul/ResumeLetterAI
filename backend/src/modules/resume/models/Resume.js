/**
 * @file Resume.js
 * @description Resume Model with flexible structure for all template categories
 * @module models/Resume
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

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
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    location: String,

    // Social/Professional Links
    linkedin: String,
    github: String,
    portfolio: String,
    leetcode: String,

    // Optional photo
    photoUrl: String,
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
      maxlength: [1000, 'Summary cannot exceed 1000 characters'],
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
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: String,
    startDate: {
      month: { type: Number, min: 1, max: 12 },
      year: { type: Number, min: 1950, max: 2100 },
    },
    endDate: {
      month: { type: Number, min: 1, max: 12 },
      year: { type: Number, min: 1950, max: 2100 },
    },
    currentlyWorking: {
      type: Boolean,
      default: false,
    },
    responsibilities: [String],
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

/**
 * Project Schema
 */
const projectSchema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    technologies: [String],
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    liveUrl: String,
    sourceCode: String,
    highlights: [String],
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

/**
 * Education Schema
 */
const educationSchema = new Schema(
  {
    degree: {
      type: String,
      required: true,
      trim: true,
    },
    institution: {
      type: String,
      required: true,
      trim: true,
    },
    location: String,
    graduationDate: {
      month: { type: Number, min: 1, max: 12 },
      year: { type: Number, min: 1950, max: 2100 },
    },
    gpa: String,
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

/**
 * Skills Schema (Categorized for IT, flexible for others)
 */
const skillsSchema = new Schema(
  {
    programmingLanguages: [String],
    frontend: [String],
    backend: [String],
    database: [String],
    devOps: [String],
    tools: [String],
    other: [String],
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
      required: true,
      trim: true,
    },
    problemsSolved: String,
    badges: String,
    profileUrl: String,
    description: String,
  },
  { _id: true }
);

/**
 * Certification Schema
 */
const certificationSchema = new Schema(
  {
    certificationName: {
      type: String,
      required: true,
      trim: true,
    },
    issuer: String,
    issueDate: {
      month: { type: Number, min: 1, max: 12 },
      year: { type: Number, min: 1950, max: 2100 },
    },
    credentialUrl: String,
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

/**
 * Language Schema
 */
const languageSchema = new Schema(
  {
    language: {
      type: String,
      required: true,
      trim: true,
    },
    proficiency: {
      type: String,
      enum: ['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'],
      default: 'Professional',
    },
  },
  { _id: true }
);

/**
 * Achievement Schema
 */
const achievementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    date: {
      month: { type: Number, min: 1, max: 12 },
      year: { type: Number, min: 1950, max: 2100 },
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

/**
 * Customization Settings Schema
 */
const customizationSchema = new Schema(
  {
    namePosition: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'center',
    },
    nameCase: {
      type: String,
      enum: ['uppercase', 'capitalize', 'normal'],
      default: 'uppercase',
    },
    colorScheme: {
      type: String,
      default: '#000000',
    },
    fontFamily: {
      type: String,
      default: 'Arial',
    },
    sectionTitles: {
      type: Map,
      of: String,
      default: {},
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
      required: true,
      index: true,
    },

    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
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
      required: true,
    },

    summary: summarySchema,

    workExperience: {
      type: [workExperienceSchema],
      default: [],
    },

    projects: {
      type: [projectSchema],
      default: [],
    },

    education: {
      type: [educationSchema],
      default: [],
    },

    skills: skillsSchema,

    competitiveProgramming: {
      type: [competitiveProgrammingSchema],
      default: [],
    },

    certifications: {
      type: [certificationSchema],
      default: [],
    },

    languages: {
      type: [languageSchema],
      default: [],
    },

    achievements: {
      type: [achievementSchema],
      default: [],
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
      default: {
        personalInfo: true,
        summary: true,
        skills: true,
        workExperience: true,
        projects: true,
        education: true,
        certifications: false,
        competitiveProgramming: false,
        achievements: false,
        languages: false,
      },
    },

    // User customization
    customization: customizationSchema,

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
// INDEXES
// ============================================
resumeSchema.index({ userId: 1, isActive: 1 });
resumeSchema.index({ userId: 1, templateId: 1 });
resumeSchema.index({ createdAt: -1 });
resumeSchema.index({ updatedAt: -1 });

// ============================================
// VIRTUALS
// ============================================

resumeSchema.virtual('isComplete').get(function () {
  return this.completionPercentage === 100;
});

// ============================================
// METHODS
// ============================================

/**
 * Calculate completion percentage based on required fields
 */
resumeSchema.methods.calculateCompletion = function () {
  let totalFields = 0;
  let filledFields = 0;

  // Personal Info (required fields)
  totalFields += 4; // name, title, email, phone
  if (this.personalInfo?.fullName) filledFields++;
  if (this.personalInfo?.jobTitle) filledFields++;
  if (this.personalInfo?.email) filledFields++;
  if (this.personalInfo?.phone) filledFields++;

  // Summary
  totalFields += 1;
  if (this.summary?.text && this.summary.text.length > 20) filledFields++;

  // Work Experience (at least 1 required)
  totalFields += 1;
  if (this.workExperience?.length > 0) filledFields++;

  // Education (at least 1 required)
  totalFields += 1;
  if (this.education?.length > 0) filledFields++;

  // Skills (at least 3 skills)
  totalFields += 1;
  const totalSkills = Object.values(this.skills?.toObject() || {})
    .flat()
    .filter(Boolean).length;
  if (totalSkills >= 3) filledFields++;

  this.completionPercentage = Math.round((filledFields / totalFields) * 100);
  return this.completionPercentage;
};

/**
 * Soft delete
 */
resumeSchema.methods.softDelete = function () {
  this.isActive = false;
  return this.save();
};

// ============================================
// STATICS
// ============================================

/**
 * Get user's active resumes
 */
resumeSchema.statics.getUserResumes = function (userId, options = {}) {
  const { limit = 0, sort = '-updatedAt' } = options;

  return this.find({ userId, isActive: true })
    .populate('templateId', 'category thumbnailUrl')
    .sort(sort)
    .limit(limit)
    .select('-__v');
};

/**
 * Get resume with template details
 */
resumeSchema.statics.getResumeWithTemplate = function (resumeId, userId) {
  return this.findOne({ _id: resumeId, userId, isActive: true })
    .populate('templateId')
    .select('-__v');
};

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Calculate completion before save
 */
resumeSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.calculateCompletion();
  }
  next();
});

/**
 * Prevent duplicate section orders
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

// ============================================
// EXPORT
// ============================================
module.exports = mongoose.model('Resume', resumeSchema);
