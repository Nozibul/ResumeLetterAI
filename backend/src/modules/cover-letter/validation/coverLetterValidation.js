// modules/cover-letter/validation/coverLetterValidation.js

const { body } = require('express-validator');

const generateValidation = [
  body('resumeSource')
    .notEmpty()
    .withMessage('Resume source is required')
    .isIn(['db', 'paste', 'upload'])
    .withMessage('Invalid resume source'),

  body('resumeId')
    .if(body('resumeSource').equals('db'))
    .notEmpty()
    .withMessage('Resume ID is required when source is db')
    .isMongoId()
    .withMessage('Invalid resume ID'),

  body('resumeText')
    .if(body('resumeSource').equals('paste'))
    .notEmpty()
    .withMessage('Resume text is required when source is paste')
    .isLength({ min: 100 })
    .withMessage('Resume text is too short'),

  body('jobDescription')
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 50 })
    .withMessage('Job description is too short'),

  body('tone')
    .optional()
    .isIn(['professional', 'creative', 'concise', 'enthusiastic', 'formal'])
    .withMessage('Invalid tone'),
];

const saveValidation = [
  body('coverLetterId')
    .notEmpty()
    .withMessage('Cover letter ID is required')
    .isMongoId()
    .withMessage('Invalid cover letter ID'),
];

module.exports = { generateValidation, saveValidation };
