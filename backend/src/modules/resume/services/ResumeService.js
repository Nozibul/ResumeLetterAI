/**
 * @file ResumeService.js
 * @description Resume business logic
 * @module modules/resume/services/ResumeService
 * @author Nozibul Islam
 * @version 1.0.0
 */

const Resume = require('../models/Resume');
const Template = require('../../templates/models/Template');
const AppError = require('../../../shared/utils/AppError');

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

  // Verify template exists and is active
  const template = await Template.findOne({ _id: templateId, isActive: true });

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

  // Populate template details for response
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
  const resume = await Resume.findOne({ _id: id, userId }).populate(
    'templateId',
    'category thumbnailUrl previewUrl structure isPremium'
  );

  if (!resume) {
    throw new AppError('Resume not found or you do not have access', 404);
  }

  return resume;
};

/**
 * Update resume content
 * @param {string} id - Resume ID
 * @param {string} userId - User ID (for ownership validation)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated resume
 */
exports.updateResume = async (id, userId, updateData) => {
  const resume = await Resume.findOne({ _id: id, userId });

  if (!resume) {
    throw new AppError('Resume not found or you do not have access', 404);
  }

  // Update content
  if (updateData.content) {
    Object.keys(updateData.content).forEach((key) => {
      if (updateData.content[key] !== undefined) {
        resume.content[key] = updateData.content[key];
      }
    });
  }

  // Update isCompleted if provided
  if (updateData.isCompleted !== undefined) {
    resume.isCompleted = updateData.isCompleted;
  }

  // Mark as modified (important for nested objects)
  resume.markModified('content');

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
  const resume = await Resume.findOne({ _id: id, userId });

  if (!resume) {
    throw new AppError('Resume not found or you do not have access', 404);
  }

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
  const resume = await Resume.findOne({ _id: id, userId });

  if (!resume) {
    throw new AppError('Resume not found or you do not have access', 404);
  }

  await resume.deleteOne();
};

/**
 * Duplicate existing resume
 * @param {string} id - Resume ID to duplicate
 * @param {string} userId - User ID (for ownership validation)
 * @returns {Promise<Object>} Duplicated resume
 */
exports.duplicateResume = async (id, userId) => {
  const originalResume = await Resume.findOne({ _id: id, userId }).lean();

  if (!originalResume) {
    throw new AppError('Resume not found or you do not have access', 404);
  }

  // Remove _id and timestamps from original
  const { _id, createdAt, updatedAt, viewCount, downloadCount, ...resumeData } = originalResume;

  // Create duplicate
  const duplicatedResume = await Resume.create({
    ...resumeData,
    resumeTitle: `${originalResume.resumeTitle} (Copy)`,
    isCompleted: false, // Reset completion status
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
  const resume = await Resume.findOne({ _id: id, userId });

  if (!resume) {
    throw new AppError('Resume not found or you do not have access', 404);
  }

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
  const resume = await Resume.findOne({ _id: id, userId });

  if (!resume) {
    throw new AppError('Resume not found or you do not have access', 404);
  }

  await resume.incrementDownload();
};
