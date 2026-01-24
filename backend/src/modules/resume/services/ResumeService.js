/**
 * @file ResumeService.js
 * @description Resume service with business logic, transactions, and optimized queries
 * @module modules/resume/services/ResumeService
 * @author Nozibul Islam
 * @version 2.0.0
 * @updated Added transaction support, removed redundant validations, optimized queries
 */

const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const Template = require('../../templates/models/Template');
const AppError = require('../../../shared/utils/AppError');

// ==========================================
// HELPER FUNCTIONS
// ==========================================

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
 * Verify template exists and is active
 * @param {string} templateId - Template ID
 * @param {Object} session - Mongoose session (optional)
 * @returns {Promise<Object>} Template document
 * @throws {AppError} If template not found
 */
const verifyTemplateExists = async (templateId, session = null) => {
  const query = Template.findOne({ _id: templateId, isActive: true });

  if (session) {
    query.session(session);
  }

  const template = await query;

  if (!template) {
    throw new AppError('Template not found or inactive', 404);
  }

  return template;
};

/**
 * Get resume with ownership verification (DRY helper)
 * @param {string} resumeId - Resume ID
 * @param {string} userId - User ID
 * @param {Object} session - Mongoose session (optional)
 * @returns {Promise<Object>} Resume document
 * @throws {AppError} If not found or no permission
 */
const getResumeWithOwnership = async (resumeId, userId, session = null) => {
  const query = Resume.findOne({ _id: resumeId, isActive: true });

  if (session) {
    query.session(session);
  }

  const resume = await query;

  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  verifyOwnership(resume, userId);

  return resume;
};

// ==========================================
// PUBLIC SERVICES
// ==========================================

/**
 * Get all user's resumes with pagination
 * @param {string} userId - User ID (already validated by middleware)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Resumes with metadata
 */
exports.getUserResumes = async (userId, options = {}) => {
  const { limit = 10, sort = 'newest' } = options;

  // Map sort options to MongoDB sort
  const sortMap = {
    newest: '-createdAt',
    oldest: 'createdAt',
    title: 'title',
  };

  const sortQuery = sortMap[sort] || '-updatedAt';

  // Use optimized static method with lean()
  const resumes = await Resume.getUserResumes(userId, {
    limit,
    sort: sortQuery,
    populate: true,
  });

  // Get total count
  const total = await Resume.countUserResumes(userId);

  return {
    resumes,
    total,
    limit,
  };
};

/**
 * Get resume by ID with template details
 * @param {string} resumeId - Resume ID (already validated)
 * @param {string} userId - User ID (already validated)
 * @returns {Promise<Object>} Resume document
 */
exports.getResumeById = async (resumeId, userId) => {
  const resume = await Resume.getResumeWithTemplate(resumeId, userId);

  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  return resume;
};

/**
 * Create new resume with transaction support
 * @param {Object} resumeData - Resume data (already validated)
 * @param {string} userId - User ID (already validated)
 * @returns {Promise<Object>} Created resume
 */
exports.createResume = async (resumeData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Verify template exists (within transaction)
    await verifyTemplateExists(resumeData.templateId, session);

    // Create resume
    const [resume] = await Resume.create(
      [
        {
          ...resumeData,
          userId,
        },
      ],
      { session }
    );

    // Populate template for response
    await resume.populate({
      path: 'templateId',
      select: 'name category thumbnailUrl',
      session,
    });

    // Commit transaction
    await session.commitTransaction();

    return resume;
  } catch (error) {
    // Rollback on any error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Update resume with transaction support
 * @param {string} resumeId - Resume ID (already validated)
 * @param {Object} updateData - Update data (already validated)
 * @param {string} userId - User ID (already validated)
 * @returns {Promise<Object>} Updated resume
 */
exports.updateResume = async (resumeId, updateData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get resume with ownership check
    const resume = await getResumeWithOwnership(resumeId, userId, session);

    // Whitelist allowed fields (security layer)
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

    // Save changes
    await resume.save({ session });

    // Populate template
    await resume.populate({
      path: 'templateId',
      select: 'name category thumbnailUrl',
      session,
    });

    // Commit transaction
    await session.commitTransaction();

    return resume;
  } catch (error) {
    // Rollback on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Delete resume (soft delete)
 * @param {string} resumeId - Resume ID (already validated)
 * @param {string} userId - User ID (already validated)
 */
exports.deleteResume = async (resumeId, userId) => {
  // Get resume with ownership check (no transaction needed for single operation)
  const resume = await getResumeWithOwnership(resumeId, userId);

  // Soft delete (atomic operation)
  await resume.softDelete();
};

/**
 * Duplicate resume with transaction support
 * @param {string} resumeId - Resume ID to duplicate (already validated)
 * @param {string} userId - User ID (already validated)
 * @param {string} newTitle - New resume title (optional, already validated)
 * @returns {Promise<Object>} Duplicated resume
 */
exports.duplicateResume = async (resumeId, userId, newTitle) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find original resume with ownership check
    const originalResume = await Resume.findOne({
      _id: resumeId,
      userId,
      isActive: true,
    })
      .session(session)
      .lean();

    if (!originalResume) {
      throw new AppError('Resume not found', 404);
    }

    // Remove metadata fields
    const {
      _id,
      createdAt,
      updatedAt,
      completionPercentage,
      __v,
      ...resumeData
    } = originalResume;

    // Create duplicate
    const [duplicatedResume] = await Resume.create(
      [
        {
          ...resumeData,
          title: newTitle || `${originalResume.title} (Copy)`,
          userId,
        },
      ],
      { session }
    );

    // Populate template
    await duplicatedResume.populate({
      path: 'templateId',
      select: 'name category thumbnailUrl',
      session,
    });

    // Commit transaction
    await session.commitTransaction();

    return duplicatedResume;
  } catch (error) {
    // Rollback on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Update resume section order
 * @param {string} resumeId - Resume ID (already validated)
 * @param {Array} sectionOrder - New section order (already validated)
 * @param {string} userId - User ID (already validated)
 * @returns {Promise<Object>} Updated resume
 */
exports.updateSectionOrder = async (resumeId, sectionOrder, userId) => {
  // Get resume with ownership check
  const resume = await getResumeWithOwnership(resumeId, userId);

  // Update section order
  resume.sectionOrder = sectionOrder;
  await resume.save();

  return resume;
};

/**
 * Update section visibility
 * @param {string} resumeId - Resume ID (already validated)
 * @param {Object} sectionVisibility - Section visibility map (already validated)
 * @param {string} userId - User ID (already validated)
 * @returns {Promise<Object>} Updated resume
 */
exports.updateSectionVisibility = async (
  resumeId,
  sectionVisibility,
  userId
) => {
  // Get resume with ownership check
  const resume = await getResumeWithOwnership(resumeId, userId);

  // Update section visibility
  resume.sectionVisibility = sectionVisibility;
  await resume.save();

  return resume;
};

/**
 * Get resume statistics for user
 * @param {string} userId - User ID (already validated)
 * @returns {Promise<Object>} Statistics
 */
exports.getResumeStats = async (userId) => {
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
 * @param {string} resumeId - Resume ID (already validated)
 * @param {string} newTemplateId - New template ID (already validated)
 * @param {string} userId - User ID (already validated)
 * @returns {Promise<Object>} Updated resume
 */
exports.switchTemplate = async (resumeId, newTemplateId, userId) => {
  // Verify new template exists
  await verifyTemplateExists(newTemplateId);

  // Get resume with ownership check
  const resume = await getResumeWithOwnership(resumeId, userId);

  // Update template (atomic operation, no transaction needed)
  resume.templateId = newTemplateId;
  await resume.save();

  // Populate new template
  await resume.populate('templateId');

  return resume;
};
