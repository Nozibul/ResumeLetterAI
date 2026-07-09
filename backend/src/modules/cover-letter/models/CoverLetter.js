/**
 * @file CoverLetter.js
 * @description Mongoose model for generated cover letters
 * @module modules/cover-letter/models/CoverLetter
 * @author Nozibul Islam
 * @version 1.0.0
 */

const mongoose = require('mongoose');

const CoverLetterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },

    resumeSource: {
      type: String,
      enum: ['db', 'paste', 'upload'],
      required: [true, 'Resume source is required'],
    },

    // Only set when resumeSource === 'db'
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
      validate: {
        validator: function (value) {
          if (this.resumeSource === 'db') return value != null;
          return true;
        },
        message: 'resumeId is required when resumeSource is "db"',
      },
    },

    // Service layer is responsible for populating this before save
    resumeText: {
      type: String,
      required: [true, 'Resume text is required'],
    },

    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
    },

    tone: {
      type: String,
      enum: ['professional', 'creative', 'concise', 'enthusiastic', 'formal'],
      default: 'professional',
    },

    content: {
      type: String,
      required: [true, 'Cover letter content is required'],
      maxlength: [5000, 'Cover letter cannot exceed 5000 characters'],
    },

    // User must explicitly save — auto-generated ones default to false
    isSaved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: function (doc, ret) {
        // resumeText is large — exclude from list responses
        // Detail view fetches by id so this is fine
        delete ret.resumeText;
        return ret;
      },
    },
  }
);

// Compound indexes cover all query patterns
// userId alone is served by the first compound index (leftmost prefix rule)
CoverLetterSchema.index({ userId: 1, createdAt: -1 });
CoverLetterSchema.index({ userId: 1, isSaved: 1 });

const CoverLetter = mongoose.model('CoverLetter', CoverLetterSchema);
module.exports = CoverLetter;
