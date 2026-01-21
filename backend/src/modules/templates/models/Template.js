/**
 * @file Template.js
 * @description Enhanced Template Model with IT/ATS Smart Defaults
 * @module models/Template
 * @version 2.0.0
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ============================================
// SUB-SCHEMAS
// ============================================

const fieldSchema = new Schema(
  {
    fieldName: {
      type: String,
      required: true,
      trim: true,
    },
    fieldType: {
      type: String,
      required: true,
      enum: [
        'text',
        'email',
        'url',
        'phone',
        'textarea',
        'date',
        'array',
        'tags',
      ],
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    placeholder: String,
  },
  { _id: false }
);

const sectionSchema = new Schema(
  {
    sectionId: {
      type: String,
      required: true,
      enum: [
        'header',
        'summary',
        'experience',
        'projects',
        'skills',
        'education',
        'certifications',
        'competitiveProgramming',
        'achievements',
        'languages',
        'references',
      ],
    },
    sectionName: {
      type: String,
      required: true,
      trim: true,
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    fields: {
      type: [fieldSchema],
      required: true,
      validate: [
        (arr) => arr.length > 0,
        'Section must have at least one field',
      ],
    },
  },
  { _id: false }
);

// IT/ATS Template Settings Schema
const templateSettingsSchema = new Schema(
  {
    // Locked settings (user cannot change)
    locked: {
      colorScheme: { type: Boolean, default: false },
      layoutColumns: { type: Boolean, default: false },
      fontFamily: { type: Boolean, default: false },
      graphics: { type: Boolean, default: false },
    },

    // Default values
    defaults: {
      colorScheme: { type: String, default: '#000000' },
      layoutColumns: { type: Number, default: 1, min: 1, max: 2 },
      fontFamily: { type: String, default: 'Arial' },
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

      // Section visibility defaults
      photoEnabled: { type: Boolean, default: false },
      linkedinEnabled: { type: Boolean, default: true },
      githubEnabled: { type: Boolean, default: true },
      portfolioEnabled: { type: Boolean, default: true },
      leetcodeEnabled: { type: Boolean, default: false },
    },

    // Customization permissions
    customizable: {
      namePosition: { type: Boolean, default: true },
      nameCase: { type: Boolean, default: true },
      sectionOrder: { type: Boolean, default: true },
      sectionVisibility: { type: Boolean, default: true },
      sectionTitles: { type: Boolean, default: true },
      photoEnabled: { type: Boolean, default: true }, // Can enable with warning
    },
  },
  { _id: false }
);

// ============================================
// MAIN SCHEMA
// ============================================

const templateSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['ats-friendly', 'corporate', 'executive', 'creative', 'it'],
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    previewUrl: {
      type: String,
      required: true,
      trim: true,
    },

    thumbnailUrl: {
      type: String,
      required: true,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
      validate: [(arr) => arr.length <= 10, 'Maximum 10 tags allowed'],
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      get: (val) => Math.round(val * 10) / 10,
    },

    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isPremium: {
      type: Boolean,
      default: false,
      index: true,
    },

    structure: {
      sections: {
        type: [sectionSchema],
        required: true,
        validate: [
          (arr) => arr.length > 0,
          'Template must have at least one section',
        ],
      },
    },

    // IT/ATS specific settings
    settings: {
      type: templateSettingsSchema,
      default: () => ({}),
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

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
templateSchema.virtual('isPopular').get(function () {
  return this.usageCount >= 100;
});

templateSchema.virtual('isATS').get(function () {
  return this.category === 'ats-friendly' || this.category === 'it';
});

// ============================================
// METHODS
// ============================================

templateSchema.methods.incrementUsage = function () {
  this.usageCount += 1;
  return this.save();
};

templateSchema.methods.updateRating = function (newRating, totalReviews) {
  if (totalReviews === 1) {
    this.rating = newRating;
  } else {
    this.rating = (this.rating * (totalReviews - 1) + newRating) / totalReviews;
  }
  return this.save();
};

// Get template with applied defaults for user
templateSchema.methods.getWithDefaults = function () {
  const template = this.toObject();

  // For IT/ATS templates, ensure settings exist
  if (this.isATS && !template.settings) {
    template.settings = this.schema.path('settings').defaultValue();
  }

  return template;
};

// ============================================
// STATICS
// ============================================

templateSchema.statics.getByCategory = function (category, options = {}) {
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

templateSchema.statics.getPopular = function (limit = 10) {
  return this.find({ isActive: true })
    .sort({ usageCount: -1, rating: -1 })
    .limit(limit)
    .select('-structure');
};

templateSchema.statics.getFeatured = function (limit = 6) {
  return this.find({ isActive: true, rating: { $gte: 4 } })
    .sort({ rating: -1, usageCount: -1 })
    .limit(limit)
    .select('-structure');
};

templateSchema.statics.getITTemplates = function (limit = 0) {
  return this.find({
    category: { $in: ['it', 'ats-friendly'] },
    isActive: true,
  })
    .sort({ rating: -1, usageCount: -1 })
    .limit(limit);
};

// ============================================
// MIDDLEWARE
// ============================================

templateSchema.pre('save', function (next) {
  // Validate unique section orders
  const orders = this.structure.sections.map((s) => s.order);
  const uniqueOrders = new Set(orders);

  if (orders.length !== uniqueOrders.size) {
    return next(new Error('Section orders must be unique'));
  }

  // Normalize tags
  if (this.tags?.length) {
    this.tags = this.tags.map((tag) => tag.toLowerCase().trim());
  }

  // Apply IT/ATS defaults if category is IT or ATS
  if (
    (this.category === 'it' || this.category === 'ats-friendly') &&
    this.isNew
  ) {
    if (!this.settings || Object.keys(this.settings).length === 0) {
      this.settings = {
        locked: {
          colorScheme: true,
          layoutColumns: true,
          fontFamily: true,
          graphics: true,
        },
        defaults: {
          colorScheme: '#000000',
          layoutColumns: 1,
          fontFamily: 'Arial',
          namePosition: 'center',
          nameCase: 'uppercase',
          photoEnabled: false,
          linkedinEnabled: true,
          githubEnabled: true,
          portfolioEnabled: true,
          leetcodeEnabled: false,
        },
        customizable: {
          namePosition: true,
          nameCase: true,
          sectionOrder: true,
          sectionVisibility: true,
          sectionTitles: true,
          photoEnabled: true,
        },
      };
    }
  }

  next();
});

// ============================================
// EXPORT
// ============================================
module.exports = mongoose.model('Template', templateSchema);
