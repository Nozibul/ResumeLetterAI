/**
 * @file ResumeService.js
 * @description Resume service with business logic and data operations
 * @module modules/resume/services/ResumeService
 * @author Nozibul Islam
 * @version 1.0.0
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
    throw new AppError('Invalid ID format', 400);
  }
};

/**
 * Verify resume ownership
 * @param {Object} resume - Resume document
 * @param {string} userId - User ID
 * @throws {AppError} If user doesn't own resume
 */
const verifyOwnership = (resume, userId) => {
  if (resume.userId.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to access this resume', 403);
  }
};

/**
 * Verify template exists
 * @param {string} templateId - Template ID
 * @returns {Promise<Object>} Template document
 * @throws {AppError} If template not found
 */
const verifyTemplateExists = async (templateId) => {
  const template = await Template.findOne({ _id: templateId, isActive: true });

  if (!template) {
    throw new AppError('Template not found or inactive', 404);
  }

  return template;
};

// ==========================================
// PUBLIC SERVICES
// ==========================================

/**
 * Get all user's resumes
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} User's resumes
 */
exports.getUserResumes = async (userId, options = {}) => {
  validateObjectId(userId);

  const { limit = 0, sort = '-updatedAt' } = options;

  const resumes = await Resume.getUserResumes(userId, { limit, sort });

  return resumes;
};

/**
 * Get resume by ID
 * @param {string} resumeId - Resume ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Resume document
 */
exports.getResumeById = async (resumeId, userId) => {
  validateObjectId(resumeId);
  validateObjectId(userId);

  const resume = await Resume.getResumeWithTemplate(resumeId, userId);

  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  return resume;
};

/**
 * Create new resume
 * @param {Object} resumeData - Resume data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created resume
 */
exports.createResume = async (resumeData, userId) => {
  validateObjectId(userId);
  validateObjectId(resumeData.templateId);

  // Verify template exists
  await verifyTemplateExists(resumeData.templateId);

  // Create resume
  const resume = await Resume.create({
    ...resumeData,
    userId,
  });

  // Populate template for response
  await resume.populate('templateId', 'category thumbnailUrl');

  return resume;
};

/**
 * Update resume
 * @param {string} resumeId - Resume ID
 * @param {Object} updateData - Update data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated resume
 */
exports.updateResume = async (resumeId, updateData, userId) => {
  validateObjectId(resumeId);
  validateObjectId(userId);

  // Find resume
  const resume = await Resume.findOne({ _id: resumeId, isActive: true });

  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  // Verify ownership
  verifyOwnership(resume, userId);

  // Whitelist allowed fields
  const allowedFields = [
    'title',
    'personalInfo',
    'summary',
    'workExperience',
    'projects',
    'education',
    'skills',
    'competitiveProgramming',
    'certifications',
    'languages',
    'achievements',
    'sectionOrder',
    'sectionVisibility',
    'customization',
  ];

  // Update only allowed fields
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      resume[field] = updateData[field];
    }
  });

  await resume.save();

  // Populate template
  await resume.populate('templateId', 'category thumbnailUrl');

  return resume;
};

/**
 * Delete resume (soft delete)
 * @param {string} resumeId - Resume ID
 * @param {string} userId - User ID
 */
exports.deleteResume = async (resumeId, userId) => {
  validateObjectId(resumeId);
  validateObjectId(userId);

  const resume = await Resume.findOne({ _id: resumeId, isActive: true });

  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  // Verify ownership
  verifyOwnership(resume, userId);

  // Soft delete
  await resume.softDelete();
};

/**
 * Duplicate resume
 * @param {string} resumeId - Resume ID to duplicate
 * @param {string} newTitle - New resume title
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Duplicated resume
 */
exports.duplicateResume = async (resumeId, newTitle, userId) => {
  validateObjectId(resumeId);
  validateObjectId(userId);

  // Find original resume
  const originalResume = await Resume.findOne({
    _id: resumeId,
    userId,
    isActive: true,
  }).lean();

  if (!originalResume) {
    throw new AppError('Resume not found', 404);
  }

  // Remove metadata
  const { _id, createdAt, updatedAt, completionPercentage, ...resumeData } =
    originalResume;

  // Create duplicate
  const duplicatedResume = await Resume.create({
    ...resumeData,
    title: newTitle || `${originalResume.title} (Copy)`,
    userId,
  });

  // Populate template
  await duplicatedResume.populate('templateId', 'category thumbnailUrl');

  return duplicatedResume;
};

/**
 * Update resume section order
 * @param {string} resumeId - Resume ID
 * @param {Array} sectionOrder - New section order
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated resume
 */
exports.updateSectionOrder = async (resumeId, sectionOrder, userId) => {
  validateObjectId(resumeId);
  validateObjectId(userId);

  const resume = await Resume.findOne({ _id: resumeId, isActive: true });

  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  verifyOwnership(resume, userId);

  // Validate section order array
  if (!Array.isArray(sectionOrder) || sectionOrder.length === 0) {
    throw new AppError('Section order must be a non-empty array', 400);
  }

  resume.sectionOrder = sectionOrder;
  await resume.save();

  return resume;
};

/**
 * Update section visibility
 * @param {string} resumeId - Resume ID
 * @param {Object} sectionVisibility - Section visibility map
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated resume
 */
exports.updateSectionVisibility = async (
  resumeId,
  sectionVisibility,
  userId
) => {
  validateObjectId(resumeId);
  validateObjectId(userId);

  const resume = await Resume.findOne({ _id: resumeId, isActive: true });

  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  verifyOwnership(resume, userId);

  // Validate visibility object
  if (
    typeof sectionVisibility !== 'object' ||
    Object.keys(sectionVisibility).length === 0
  ) {
    throw new AppError('Section visibility must be a non-empty object', 400);
  }

  resume.sectionVisibility = sectionVisibility;
  await resume.save();

  return resume;
};

/**
 * Get resume statistics for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics
 */
exports.getResumeStats = async (userId) => {
  validateObjectId(userId);

  const stats = await Resume.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true,
      },
    },
    {
      $group: {
        _id: null,
        totalResumes: { $sum: 1 },
        completedResumes: {
          $sum: { $cond: [{ $eq: ['$completionPercentage', 100] }, 1, 0] },
        },
        averageCompletion: { $avg: '$completionPercentage' },
      },
    },
    {
      $project: {
        _id: 0,
        totalResumes: 1,
        completedResumes: 1,
        averageCompletion: { $round: ['$averageCompletion', 2] },
      },
    },
  ]);

  return (
    stats[0] || {
      totalResumes: 0,
      completedResumes: 0,
      averageCompletion: 0,
    }
  );
};

/**
 * Switch resume template
 * @param {string} resumeId - Resume ID
 * @param {string} newTemplateId - New template ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated resume
 */
exports.switchTemplate = async (resumeId, newTemplateId, userId) => {
  validateObjectId(resumeId);
  validateObjectId(newTemplateId);
  validateObjectId(userId);

  // Verify new template exists
  await verifyTemplateExists(newTemplateId);

  const resume = await Resume.findOne({ _id: resumeId, isActive: true });

  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  verifyOwnership(resume, userId);

  resume.templateId = newTemplateId;
  await resume.save();

  // Populate new template
  await resume.populate('templateId');

  return resume;
};
