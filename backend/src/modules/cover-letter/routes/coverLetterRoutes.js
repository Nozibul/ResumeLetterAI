/**
 * @file coverLetterRoutes.js
 * @description Cover letter routes
 * @module modules/cover-letter/routes/coverLetterRoutes
 * @author Nozibul Islam
 * @version 1.0.0
 */

const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const { protect } = require('../../auth/middlewares/authMiddleware');
const { validate } = require('../../middleware/validate');
const {
  generateCoverLetterSchema,
  saveCoverLetterSchema,
  getCoverLetterSchema,
} = require('../validation/coverLetterValidation');
const CoverLetterController = require('../controllers/CoverLetterController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
});

const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: {
    success: false,
    message: 'Too many cover letters generated. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(protect);

router.post(
  '/generate',
  generateLimiter,
  upload.single('resume'),
  validate(generateCoverLetterSchema),
  CoverLetterController.generate
);

router.post(
  '/save',
  validate(saveCoverLetterSchema),
  CoverLetterController.save
);

router.get('/', CoverLetterController.list);

router.get(
  '/:id',
  validate(getCoverLetterSchema),
  CoverLetterController.getById
);

module.exports = router;
