/**
 * @file ResumeService.js
 * @description Resume service — business logic, transactions, optimized queries
 * @module modules/resume/services/ResumeService
 * @author Nozibul Islam
 * @version 3.0.0
 * @updated
 *   v3.0.0 — Bug fixes and improvements:
 *   - duplicateResume: replaced manual lean+spread logic with model's duplicate() method.
 *     The model already handles stripIds() for sub-documents; duplicating that logic here
 *     created a drift risk between the two implementations.
 *   - updateSectionVisibility: was replacing the entire sectionVisibility object on partial
 *     updates, silently dropping fields the client did not send. Now merges field-by-field.
 *   - createResume: removed session from populate() call — Mongoose populate() does not
 *     support a session option and was silently ignoring it. Populate now runs after commit.
 *   - switchTemplate: added select fields to populate() for consistency with other methods.
 *   - updateResume: allowedFields whitelist kept as an intentional defense-in-depth layer
 *     (validation schema is the first gate; this is the second). Comment added for clarity.
 *   - deleteResume: no transaction needed for a single atomic operation. Note added that
 *     a transaction will be required if audit logging or PDF cleanup is added later.
 *   - getUserResumes: two separate DB calls (data + count). MongoDB $facet could combine
 *     them, but at current scale the clarity of two named calls is preferred. Noted.
 */

const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const Template = require('../../templates/models/Template');
const AppError = require('../../../shared/utils/AppError');

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Verify the requesting user owns this resume.
 * Throws 403 rather than 404 to avoid leaking existence information
 * only after ownership is already confirmed by getResumeWithOwnership.
 */
const verifyOwnership = (resume, userId) => {
  if (resume.userId.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to access this resume', 403);
  }
};

/**
 * Verify a template exists and is active.
 * Accepts an optional Mongoose session for use inside transactions.
 */
const verifyTemplateExists = async (templateId, session = null) => {
  const query = Template.findOne({ _id: templateId, isActive: true });
  if (session) query.session(session);

  const template = await query;
  if (!template) throw new AppError('Template not found or inactive', 404);

  return template;
};

/**
 * Fetch a resume by ID and verify ownership in one place.
 * Every service method that touches a specific resume goes through this,
 * ensuring ownership is always checked before any mutation.
 */
const getResumeWithOwnership = async (resumeId, userId, session = null) => {
  const query = Resume.findOne({ _id: resumeId, isActive: true });
  if (session) query.session(session);

  const resume = await query;
  if (!resume) throw new AppError('Resume not found', 404);

  verifyOwnership(resume, userId);
  return resume;
};

// ============================================================
// PUBLIC SERVICE METHODS
// ============================================================

/**
 * Get all active resumes for a user with pagination.
 *
 * NOTE: This makes two DB round-trips (data + count). MongoDB $facet could
 * combine them into one, but at current scale the clarity of two named static
 * methods is preferred. Revisit if this becomes a performance bottleneck.
 */
exports.getUserResumes = async (userId, options = {}) => {
  const { limit = 10, sort = 'newest' } = options;

  const sortMap = {
    newest: '-createdAt',
    oldest: 'createdAt',
    title: 'title',
  };
  const sortQuery = sortMap[sort] || '-updatedAt';

  const [resumes, total] = await Promise.all([
    Resume.getUserResumes(userId, { limit, sort: sortQuery, populate: true }),
    Resume.countUserResumes(userId),
  ]);

  return { resumes, total, limit };
};

/**
 * Get a single resume with full template details.
 * Ownership is enforced inside getResumeWithTemplate via the userId filter.
 */
exports.getResumeById = async (resumeId, userId) => {
  const resume = await Resume.getResumeWithTemplate(resumeId, userId);
  if (!resume) throw new AppError('Resume not found', 404);
  return resume;
};

/**
 * Create a new resume inside a transaction.
 *
 * populate() is intentionally called AFTER commitTransaction().
 * Mongoose populate() does not accept a session option — passing one is
 * silently ignored, and running populate inside an uncommitted transaction
 * can read stale data depending on the MongoDB read concern. Post-commit
 * populate is the correct pattern.
 */
exports.createResume = async (resumeData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await verifyTemplateExists(resumeData.templateId, session);

    const [resume] = await Resume.create([{ ...resumeData, userId }], {
      session,
    });

    await session.commitTransaction();

    // Populate after commit — see note above.
    await resume.populate('templateId', 'name category thumbnailUrl');

    return resume;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Partially update a resume inside a transaction.
 *
 * The allowedFields whitelist here is an intentional defense-in-depth layer.
 * The Zod validation schema is the first gate (unknown keys are stripped there).
 * This whitelist is the second gate — it ensures that even if validation is
 * bypassed or a new field is added to the schema without updating the whitelist,
 * sensitive fields like userId, isActive, and completionPercentage cannot be
 * overwritten via the update endpoint.
 */
exports.updateResume = async (resumeId, updateData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const resume = await getResumeWithOwnership(resumeId, userId, session);

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
      'sectionOrder',
      'sectionVisibility',
      'customization',
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        resume[field] = updateData[field];
      }
    });

    await resume.save({ session });
    await session.commitTransaction();

    // Populate after commit — same reason as createResume.
    await resume.populate('templateId', 'name category thumbnailUrl');

    return resume;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Soft-delete a resume (sets isActive: false).
 *
 * No transaction needed — softDelete() is a single atomic document update.
 * NOTE: if audit logging or cloud PDF cleanup (e.g. Cloudinary) is added
 * in the future, wrap this in a transaction at that point.
 */
exports.deleteResume = async (resumeId, userId) => {
  const resume = await getResumeWithOwnership(resumeId, userId);
  await resume.softDelete();
  return { id: resumeId }; // return id so controller can send it back to client
};

/**
 * Duplicate a resume.
 *
 * Delegates entirely to the model's duplicate() method, which already handles:
 *   - stripping sub-document _ids (stripIds helper) to avoid ObjectId conflicts
 *   - resetting completionPercentage so pre-save recalculates cleanly
 * Previously this service had its own lean+spread logic which duplicated that
 * responsibility and would have drifted if the model's duplicate() was updated.
 */
exports.duplicateResume = async (resumeId, userId, newTitle) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const original = await getResumeWithOwnership(resumeId, userId, session);

    // model.duplicate() handles stripIds and completionPercentage reset internally
    const duplicated = await original.duplicate(userId, newTitle);

    await session.commitTransaction();

    // Populate after commit
    await duplicated.populate('templateId', 'name category thumbnailUrl');

    return duplicated;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Update the section order array for a resume.
 */
exports.updateSectionOrder = async (resumeId, sectionOrder, userId) => {
  const resume = await getResumeWithOwnership(resumeId, userId);
  resume.sectionOrder = sectionOrder;
  await resume.save();
  return resume;
};

/**
 * Partially update section visibility.
 *
 * FIXED: previously did `resume.sectionVisibility = sectionVisibility` which
 * replaced the entire object on partial updates — fields the client did not
 * send were silently dropped. Now merges only the provided keys so untouched
 * sections keep their existing visibility state.
 */
exports.updateSectionVisibility = async (
  resumeId,
  sectionVisibility,
  userId
) => {
  const resume = await getResumeWithOwnership(resumeId, userId);

  Object.assign(resume.sectionVisibility, sectionVisibility);

  // sectionVisibility uses explicit Boolean schema fields (not Mixed), so
  // Mongoose tracks changes automatically — no markModified() needed.
  await resume.save();

  return resume;
};

/**
 * Get aggregated resume statistics for a user.
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
    stats[0] || { totalResumes: 0, completedResumes: 0, averageCompletion: 0 }
  );
};

/**
 * Switch a resume to a different template.
 *
 * FIXED: populate() previously had no select fields, returning the full template
 * document. Now consistent with all other methods ('name category thumbnailUrl').
 * No transaction needed — two sequential operations where the second (save) is
 * atomic and verifyTemplateExists is a read-only guard.
 */
exports.switchTemplate = async (resumeId, newTemplateId, userId) => {
  await verifyTemplateExists(newTemplateId);

  const resume = await getResumeWithOwnership(resumeId, userId);
  resume.templateId = newTemplateId;
  await resume.save();

  await resume.populate('templateId', 'name category thumbnailUrl');

  return resume;
};
