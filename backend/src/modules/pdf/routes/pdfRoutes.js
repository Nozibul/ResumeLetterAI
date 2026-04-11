/**
 * @file pdfRoutes.js
 * @description PDF generation routes.
 * @module modules/pdf/routes/pdfRoutes
 * @author Nozibul Islam
 */

'use strict';

const express = require('express');
const { generateResumePdf } = require('../controllers/pdfController');
const { protect } = require('../../auth/middlewares/authMiddleware');
const router = express.Router();

// POST /api/pdf/generate
// Auth required — user must be logged in to generate PDF
router.post('/generate', protect, generateResumePdf);

module.exports = router;
