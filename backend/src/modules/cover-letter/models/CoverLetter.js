// modules/cover-letter/models/CoverLetter.js

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

    // Service layer responsibility populate
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
      maxlength: [5000, 'Cover letter content cannot exceed 5000 characters'],
    },

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
        delete ret.resumeText;
        return ret;
      },
    },
  }
);

CoverLetterSchema.index({ userId: 1, createdAt: -1 });
CoverLetterSchema.index({ userId: 1, isSaved: 1 });

const CoverLetter = mongoose.model('CoverLetter', CoverLetterSchema);
module.exports = CoverLetter;
