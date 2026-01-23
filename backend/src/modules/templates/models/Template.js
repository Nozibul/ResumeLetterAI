/**
 * @file Template.js
 * @description Enhanced Template Model with IT/ATS Smart Defaults
 * @module models/Template
 * @version 3.0.0
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
    placeholder: {
      type: String,
      trim: true,
    },
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
      max: 50,
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
      colorScheme: {
        type: String,
        default: '#000000',
        match: /^#[0-9A-Fa-f]{6}$/,
      },
      layoutColumns: { type: Number, default: 1, min: 1, max: 2 },
      fontFamily: { type: String, default: 'Arial', trim: true },
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
      photoEnabled: { type: Boolean, default: true },
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
      required: [true, 'Category is required'],
      enum: {
        values: ['ats-friendly', 'corporate', 'executive', 'creative', 'it'],
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    previewUrl: {
      type: String,
      required: [true, 'Preview URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Preview URL must be a valid URL',
      },
    },

    thumbnailUrl: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Thumbnail URL must be a valid URL',
      },
    },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          // Check max length
          if (arr.length > 10) return false;

          // Check for empty strings
          if (arr.some((tag) => !tag || tag.trim() === '')) return false;

          // Check for duplicates
          const normalized = arr.map((tag) => tag.toLowerCase().trim());
          return normalized.length === new Set(normalized).size;
        },
        message: 'Tags must be unique, non-empty, and maximum 10 allowed',
      },
    },

    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },

    usageCount: {
      type: Number,
      default: 0,
      min: [0, 'Usage count cannot be negative'],
    },

    isPremium: {
      type: Boolean,
      default: false,
      index: true,
    },

    structure: {
      sections: {
        type: [sectionSchema],
        required: [true, 'Template structure is required'],
        validate: [
          (arr) => arr.length > 0,
          'Template must have at least one section',
        ],
      },
    },

    // IT/ATS specific settings with proper defaults
    settings: {
      type: templateSettingsSchema,
      default: function () {
        // Return full default settings object
        return {
          locked: {
            colorScheme: false,
            layoutColumns: false,
            fontFamily: false,
            graphics: false,
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
      },
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES (Optimized)
// ============================================
templateSchema.index({ category: 1, isPremium: 1, isActive: 1 });
templateSchema.index({ usageCount: -1, rating: -1 });
templateSchema.index({ rating: -1, usageCount: -1 });
templateSchema.index({ createdAt: -1 });
templateSchema.index({ tags: 1 });

// ============================================
// VIRTUALS
// ============================================
templateSchema.virtual('isPopular').get(function () {
  return this.usageCount >= 100;
});

templateSchema.virtual('isHighlyRated').get(function () {
  return this.rating >= 4;
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Increment template usage count
 */
templateSchema.methods.incrementUsage = async function () {
  this.usageCount += 1;
  return this.save({ validateBeforeSave: false });
};

/**
 * Update template rating with new review
 * @param {Number} newRating - New rating (1-5)
 * @param {Number} totalReviews - Total number of reviews after this one
 */
templateSchema.methods.updateRating = async function (newRating, totalReviews) {
  if (!totalReviews || totalReviews < 1) {
    throw new Error('Total reviews must be at least 1');
  }

  if (totalReviews === 1) {
    this.rating = newRating;
  } else {
    // Weighted average calculation
    this.rating = (this.rating * (totalReviews - 1) + newRating) / totalReviews;
    // Round to 1 decimal place
    this.rating = Math.round(this.rating * 10) / 10;
  }

  return this.save({ validateBeforeSave: false });
};

/**
 * Get template with applied defaults for user
 * Returns a plain object with all defaults applied
 */
templateSchema.methods.getWithDefaults = function () {
  const template = this.toObject();

  // Check if this is an ATS-friendly template
  const isATSCategory =
    this.category === 'ats-friendly' || this.category === 'it';

  // Apply IT/ATS defaults if needed
  if (isATSCategory && !template.settings) {
    template.settings = {
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

  return template;
};

/**
 * Check if template is ATS-friendly
 */
templateSchema.methods.isATSFriendly = function () {
  return this.category === 'ats-friendly' || this.category === 'it';
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Get templates by category
 */
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

/**
 * Get popular templates
 */
templateSchema.statics.getPopular = function (limit = 10) {
  return this.find({ isActive: true })
    .sort({ usageCount: -1, rating: -1 })
    .limit(limit)
    .select('-structure');
};

/**
 * Get featured templates (high rated)
 */
templateSchema.statics.getFeatured = function (limit = 6) {
  return this.find({ isActive: true, rating: { $gte: 4 } })
    .sort({ rating: -1, usageCount: -1 })
    .limit(limit)
    .select('-structure');
};

/**
 * Get IT/ATS templates
 */
templateSchema.statics.getITTemplates = function (limit = 0) {
  return this.find({
    category: { $in: ['it', 'ats-friendly'] },
    isActive: true,
  })
    .sort({ rating: -1, usageCount: -1 })
    .limit(limit);
};

/**
 * Get category statistics
 */
templateSchema.statics.getCategoryStats = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        totalUsage: { $sum: '$usageCount' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Pre-save middleware for validation and defaults
 */
templateSchema.pre('save', function (next) {
  // Validate unique section orders
  if (this.isModified('structure.sections')) {
    const orders = this.structure.sections.map((s) => s.order);
    const uniqueOrders = new Set(orders);

    if (orders.length !== uniqueOrders.size) {
      return next(new Error('Section orders must be unique'));
    }

    // Validate unique section IDs
    const sectionIds = this.structure.sections.map((s) => s.sectionId);
    const uniqueSectionIds = new Set(sectionIds);

    if (sectionIds.length !== uniqueSectionIds.size) {
      return next(new Error('Section IDs must be unique'));
    }

    // Validate unique field names within each section
    for (const section of this.structure.sections) {
      const fieldNames = section.fields.map((f) => f.fieldName);
      const uniqueFieldNames = new Set(fieldNames);

      if (fieldNames.length !== uniqueFieldNames.size) {
        return next(
          new Error(
            `Field names must be unique within section: ${section.sectionName}`
          )
        );
      }
    }
  }

  // Normalize tags
  if (this.isModified('tags') && this.tags?.length) {
    this.tags = [...new Set(this.tags.map((tag) => tag.toLowerCase().trim()))];
  }

  // Apply IT/ATS strict defaults for new documents or category changes
  if (
    (this.isNew || this.isModified('category')) &&
    (this.category === 'it' || this.category === 'ats-friendly')
  ) {
    // Ensure strict ATS settings
    if (!this.settings || !this.settings.locked) {
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

/**
 * Post-save middleware for logging
 */
templateSchema.post('save', function (doc) {
  console.log(`New template created: ${doc._id}`);
});

// ============================================
// QUERY MIDDLEWARE
// ============================================

/**
 * Auto-populate createdBy on find queries
 */
templateSchema.pre(/^find/, function (next) {
  // Optionally populate createdBy
  // this.populate('createdBy', 'name email');
  next();
});

// ============================================
// EXPORT
// ============================================
module.exports = mongoose.model('Template', templateSchema);
