/**
 * @file Resume.js
 * @description Optimized Resume Model for storing user's resume data
 * @module models/Resume
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ============================================
// SUB-SCHEMAS (Dynamic Content)
// ============================================

const headerSchema = new Schema({
  fullName: String,
  position: String,
  email: String,
  phone: String,
  linkedin: String,
  github: String,
  portfolio: String,
  location: String
}, { _id: false });

const profileSchema = new Schema({
  summary: String
}, { _id: false });

const experienceSchema = new Schema({
  companyName: String,
  position: String,
  startDate: Date,
  endDate: Date,
  currentlyWorking: { type: Boolean, default: false },
  description: String,
  responsibilities: [String]
}, { _id: false });

const skillSchema = new Schema({
  skillName: String,
  proficiency: String
}, { _id: false });

const educationSchema = new Schema({
  degree: String,
  institution: String,
  graduationYear: Date,
  cgpa: String
}, { _id: false });

const projectSchema = new Schema({
  projectName: String,
  description: String,
  technologies: [String],
  projectUrl: String
}, { _id: false });

const achievementSchema = new Schema({
  title: String,
  description: String,
  date: Date
}, { _id: false });

const referenceSchema = new Schema({
  name: String,
  position: String,
  company: String,
  email: String,
  phone: String
}, { _id: false });

const technologySchema = new Schema({
  category: String,
  techStack: [String]
}, { _id: false });

// ============================================
// MAIN RESUME SCHEMA
// ============================================

const resumeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'Template',
    required: true,
    index: true
  },
  
  resumeTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    default: 'Untitled Resume'
  },
  
  // Resume Content (Dynamic based on template structure)
  content: {
    header: headerSchema,
    profile: profileSchema,
    experience: [experienceSchema],
    skills: [skillSchema],
    education: [educationSchema],
    projects: [projectSchema],
    achievements: [achievementSchema],
    references: [referenceSchema],
    technologies: [technologySchema]
  },
  
  // Metadata
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  lastEditedAt: {
    type: Date,
    default: Date.now
  },
  
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// INDEXES
// ============================================
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ userId: 1, templateId: 1 });
resumeSchema.index({ userId: 1, isCompleted: 1 });

// ============================================
// VIRTUALS
// ============================================

resumeSchema.virtual('template', {
  ref: 'Template',
  localField: 'templateId',
  foreignField: '_id',
  justOne: true
});

resumeSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// ============================================
// METHODS
// ============================================

resumeSchema.methods.calculateCompletion = function() {
  const template = this.populated('templateId') || this.templateId;
  
  if (!template || !template.structure) {
    return 0;
  }
  
  const requiredSections = template.structure.sections.filter(s => s.isRequired);
  
  if (requiredSections.length === 0) {
    return 100;
  }
  
  let filledSections = 0;
  
  requiredSections.forEach(section => {
    const sectionData = this.content[section.sectionId];
    
    if (sectionData) {
      if (Array.isArray(sectionData)) {
        if (sectionData.length > 0) filledSections++;
      } else if (Object.keys(sectionData.toObject()).length > 0) {
        filledSections++;
      }
    }
  });
  
  this.completionPercentage = Math.round((filledSections / requiredSections.length) * 100);
  this.isCompleted = this.completionPercentage === 100;
  
  return this.completionPercentage;
};

resumeSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

resumeSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

resumeSchema.methods.updateLastEdited = function() {
  this.lastEditedAt = Date.now();
  return this.save();
};

// ============================================
// STATICS
// ============================================

resumeSchema.statics.getByUser = function(userId, options = {}) {
  const { limit = 0, sortBy = '-updatedAt' } = options;
  
  return this.find({ userId })
    .sort(sortBy)
    .limit(limit)
    .populate('templateId', 'category thumbnailUrl isPremium');
};

resumeSchema.statics.getCompleted = function(userId) {
  return this.find({ userId, isCompleted: true })
    .sort('-updatedAt')
    .populate('templateId', 'category thumbnailUrl');
};

resumeSchema.statics.getDrafts = function(userId) {
  return this.find({ userId, isCompleted: false })
    .sort('-updatedAt')
    .populate('templateId', 'category thumbnailUrl');
};

// ============================================
// MIDDLEWARE
// ============================================

resumeSchema.pre('save', function(next) {
  // Auto-update lastEditedAt on content change
  if (this.isModified('content')) {
    this.lastEditedAt = Date.now();
  }
  
  next();
});

resumeSchema.post('save', function(doc, next) {
  // Increment template usage count when new resume is created
  if (doc.isNew) {
    mongoose.model('Template').findByIdAndUpdate(
      doc.templateId,
      { $inc: { usageCount: 1 } }
    ).exec();
  }
  next();
});

// EXPORT
module.exports = mongoose.model('Resume', resumeSchema);