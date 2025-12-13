/**
 * @file ResumeService.js
 * @description Resume business logic (Optimized & Production-ready)
 * @module modules/resume/services/ResumeService
 * @author Nozibul Islam
 * @version 2.0.0
 */

const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const Template = require('../../templates/models/Template');
const AppError = require('../../../shared/utils/AppError');

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @throws {AppError} If invalid ID
 */
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid resume ID format', 400);
  }
};

/**
 * Verify resume ownership
 * @param {Object} resume - Resume document
 * @param {string} userId - User ID
 * @throws {AppError} If user doesn't own the resume
 */
const verifyOwnership = (resume, userId) => {
  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  if (resume.userId.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to access this resume', 403);
  }
};

// ==========================================
// RESUME CRUD OPERATIONS
// ==========================================

/**
 * Create new resume
 * @param {string} userId - User ID
 * @param {Object} resumeData - Resume data
 * @returns {Promise<Object>} Created resume
 */
exports.createResume = async (userId, resumeData) => {
  const { templateId, resumeTitle, content } = resumeData;

  // Validate template ID format
  validateObjectId(templateId);

  // Verify template exists and is active
  const template = await Template.findOne({ _id: templateId, isActive: true }).lean();

  if (!template) {
    throw new AppError('Template not found or inactive', 404);
  }

  // Create resume
  const resume = await Resume.create({
    userId,
    templateId,
    resumeTitle: resumeTitle || 'Untitled Resume',
    content: content || {},
  });

  // Populate template details
  await resume.populate('templateId', 'category thumbnailUrl isPremium');

  return resume;
};

/**
 * Get all resumes of a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of resumes
 */
exports.getAllResumes = async (userId) => {
  const resumes = await Resume.find({ userId })
    .populate('templateId', 'category thumbnailUrl isPremium')
    .select('-__v')
    .sort('-updatedAt')
    .lean();

  return resumes;
};

/**
 * Get draft resumes (incomplete)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Draft resumes
 */
exports.getDraftResumes = async (userId) => {
  const drafts = await Resume.find({ userId, isCompleted: false })
    .populate('templateId', 'category thumbnailUrl isPremium')
    .select('-__v')
    .sort('-updatedAt')
    .lean();

  return drafts;
};

/**
 * Get completed resumes
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Completed resumes
 */
exports.getCompletedResumes = async (userId) => {
  const completed = await Resume.find({ userId, isCompleted: true })
    .populate('templateId', 'category thumbnailUrl isPremium')
    .select('-__v')
    .sort('-updatedAt')
    .lean();

  return completed;
};

/**
 * Get single resume by ID
 * @param {string} id - Resume ID
 * @param {string} userId - User ID (for ownership validation)
 * @returns {Promise<Object>} Resume details
 */
exports.getResumeById = async (id, userId) => {
  validateObjectId(id);

  const resume = await Resume.findById(id)
    .populate('templateId', 'category thumbnailUrl previewUrl structure isPremium')
    .select('-__v');

  verifyOwnership(resume, userId);

  return resume;
};

/**
 * Update resume content (with whitelist)
 * @param {string} id - Resume ID
 * @param {string} userId - User ID (for ownership validation)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated resume
 */
exports.updateResume = async (id, userId, updateData) => {
  validateObjectId(id);

  const resume = await Resume.findById(id);

  verifyOwnership(resume, userId);

  // Whitelist allowed fields
  const allowedFields = ['content', 'isCompleted'];

  // Update allowed fields
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      resume[field] = updateData[field];
    }
  });

  // Mark content as modified (for nested objects)
  if (updateData.content) {
    resume.markModified('content');
  }

  await resume.save();

  // Populate for response
  await resume.populate('templateId', 'category thumbnailUrl isPremium');

  return resume;
};

/**
 * Update resume title
 * @param {string} id - Resume ID
 * @param {string} userId - User ID (for ownership validation)
 * @param {string} resumeTitle - New title
 * @returns {Promise<Object>} Updated resume
 */
exports.updateResumeTitle = async (id, userId, resumeTitle) => {
  validateObjectId(id);

  const resume = await Resume.findById(id);

  verifyOwnership(resume, userId);

  resume.resumeTitle = resumeTitle;
  await resume.save();

  return resume;
};

/**
 * Delete resume
 * @param {string} id - Resume ID
 * @param {string} userId - User ID (for ownership validation)
 * @returns {Promise<void>}
 */
exports.deleteResume = async (id, userId) => {
  validateObjectId(id);

  const resume = await Resume.findById(id);

  verifyOwnership(resume, userId);

  await resume.deleteOne();
};

/**
 * Duplicate existing resume
 * @param {string} id - Resume ID to duplicate
 * @param {string} userId - User ID (for ownership validation)
 * @returns {Promise<Object>} Duplicated resume
 */
exports.duplicateResume = async (id, userId) => {
  validateObjectId(id);

  const originalResume = await Resume.findById(id).lean();

  verifyOwnership(originalResume, userId);

  // Remove metadata
  const { _id, createdAt, updatedAt, viewCount, downloadCount, __v, ...resumeData } =
    originalResume;

  // Create duplicate with reset metrics
  const duplicatedResume = await Resume.create({
    ...resumeData,
    resumeTitle: `${originalResume.resumeTitle} (Copy)`,
    isCompleted: false,
    viewCount: 0,
    downloadCount: 0,
  });

  // Populate for response
  await duplicatedResume.populate('templateId', 'category thumbnailUrl isPremium');

  return duplicatedResume;
};

/**
 * Toggle resume visibility (public/private)
 * @param {string} id - Resume ID
 * @param {string} userId - User ID (for ownership validation)
 * @param {boolean} isPublic - Public status
 * @returns {Promise<Object>} Updated resume
 */
exports.toggleVisibility = async (id, userId, isPublic) => {
  validateObjectId(id);

  // Validate isPublic is boolean
  if (typeof isPublic !== 'boolean') {
    throw new AppError('isPublic must be a boolean value', 400);
  }

  const resume = await Resume.findById(id);

  verifyOwnership(resume, userId);

  resume.isPublic = isPublic;
  await resume.save();

  return resume;
};

/**
 * Track resume download
 * @param {string} id - Resume ID
 * @param {string} userId - User ID (for ownership validation)
 * @returns {Promise<void>}
 */
exports.trackDownload = async (id, userId) => {
  validateObjectId(id);

  const resume = await Resume.findById(id);

  verifyOwnership(resume, userId);

  await resume.incrementDownload();
};
