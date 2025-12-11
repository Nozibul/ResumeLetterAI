/**
 * @file Template.js
 * @description Optimized Template Model for Resume Builder
 * @module models/Template
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ============================================
// SUB-SCHEMAS
// ============================================

const fieldSchema = new Schema({
  fieldName: {
    type: String,
    required: true,
    trim: true
  },
  fieldType: {
    type: String,
    required: true,
    enum: ['text', 'email', 'url', 'phone', 'textarea', 'date', 'array']
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  placeholder: String
}, { _id: false });

const sectionSchema = new Schema({
  sectionId: {
    type: String,
    required: true,
    enum: ['header', 'profile', 'experience', 'skills', 'education', 'projects', 'achievements', 'references', 'technologies']
  },
  sectionName: {
    type: String,
    required: true,
    trim: true
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  fields: {
    type: [fieldSchema],
    required: true,
    validate: [arr => arr.length > 0, 'Section must have at least one field']
  }
}, { _id: false });

// ============================================
// MAIN SCHEMA
// ============================================

const templateSchema = new Schema({
  category: {
    type: String,
    required: true,
    enum: ['ats-friendly', 'corporate', 'executive', 'creative', 'it'],
    index: true
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  previewUrl: {
    type: String,
    required: true,
    trim: true
  },
  
  thumbnailUrl: {
    type: String,
    required: true,
    trim: true
  },
  
  tags: {
    type: [String],
    default: [],
    validate: [arr => arr.length <= 10, 'Maximum 10 tags allowed']
  },
  
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    get: val => Math.round(val * 10) / 10
  },
  
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  isPremium: {
    type: Boolean,
    default: false,
    index: true
  },
  
  structure: {
    sections: {
      type: [sectionSchema],
      required: true,
      validate: [arr => arr.length > 0, 'Template must have at least one section']
    }
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

// ============================================
// INDEXES
// ============================================
templateSchema.index({ category: 1, isPremium: 1, isActive: 1 });
templateSchema.index({ usageCount: -1 });
templateSchema.index({ rating: -1 });
templateSchema.index({ createdAt: -1 });

// ============================================
// VIRTUALS
// ============================================
templateSchema.virtual('isPopular').get(function() {
  return this.usageCount >= 100;
});

// ============================================
// METHODS
// ============================================

templateSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

templateSchema.methods.updateRating = function(newRating, totalReviews) {
  if (totalReviews === 1) {
    this.rating = newRating;
  } else {
    this.rating = ((this.rating * (totalReviews - 1)) + newRating) / totalReviews;
  }
  return this.save();
};

// ============================================
// STATICS
// ============================================

templateSchema.statics.getByCategory = function(category, options = {}) {
  const { limit = 0, isPremium } = options;
  const query = { category, isActive: true };
  
  if (isPremium !== undefined) {
    query.isPremium = isPremium;
  }
  
  return this.find(query)
    .sort({ rating: -1, usageCount: -1 })
    .limit(limit)
    .select('-structure');
};

templateSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ usageCount: -1, rating: -1 })
    .limit(limit)
    .select('-structure');
};

templateSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ isActive: true, rating: { $gte: 4 } })
    .sort({ rating: -1, usageCount: -1 })
    .limit(limit)
    .select('-structure');
};

// ============================================
// MIDDLEWARE
// ============================================

templateSchema.pre('save', function(next) {
  // Validate unique section orders
  const orders = this.structure.sections.map(s => s.order);
  const uniqueOrders = new Set(orders);
  
  if (orders.length !== uniqueOrders.size) {
    return next(new Error('Section orders must be unique'));
  }
  
  // Normalize tags
  if (this.tags?.length) {
    this.tags = this.tags.map(tag => tag.toLowerCase().trim());
  }
  
  next();
});

// ============================================
// EXPORT
// ============================================
module.exports = mongoose.model('Template', templateSchema);

/*
// Dynamic form (✅ Smart approach) // n2 time complexity
template.structure.sections.map(section => {
  return section.fields.map(field => {
    return <Input type={field.fieldType} name={field.fieldName} />
  })
}) 
*/