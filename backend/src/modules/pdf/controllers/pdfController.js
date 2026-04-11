/**
 * @file pdfController.js
 * @description Handles PDF generation requests.
 *              Validates input, calls services, returns PDF buffer + Cloudinary URL.
 * @module modules/pdf/controllers/pdfController
 * @author Nozibul Islam
 */

'use strict';

const { generatePdf } = require('../services/PdfService');
const AppError = require('../../../shared/utils/AppError');

// ==========================================
// VALIDATION
// ==========================================

const validateInput = (resumeData, resumeId) => {
  if (!resumeData || typeof resumeData !== 'object') {
    throw new AppError('resumeData is required', 400);
  }

  const p = resumeData.personalInfo;
  if (!p || typeof p !== 'object') {
    throw new AppError('resumeData.personalInfo is required', 400);
  }

  if (!p.fullName?.trim() && !p.email?.trim()) {
    throw new AppError(
      'personalInfo must have at least fullName or email',
      400
    );
  }

  if (!resumeId || typeof resumeId !== 'string') {
    throw new AppError('resumeId is required', 400);
  }
};

// ==========================================
// CONTROLLER
// ==========================================

/**
 * POST /api/pdf/generate
 *
 * Request body:
 *   {
 *     resumeData:    Object  — full resume data
 *     customization: Object  — font, color, alignment (optional)
 *     resumeId:      string  — MongoDB resume document ID
 *   }
 *
 * Response:
 *   PDF buffer with headers:
 *     X-Pdf-Url      — Cloudinary permanent URL
 *     X-Pdf-PublicId — Cloudinary publicId
 */
exports.generateResumePdf = async (req, res, next) => {
  try {
    const { resumeData, customization, resumeId } = req.body;
    const userId = req.user._id;

    // Validate input
    validateInput(resumeData, resumeId);

    // Generate PDF + upload to Cloudinary
    const { pdfBuffer, pdfUrl, pdfPublicId } = await generatePdf(
      resumeData,
      customization,
      userId,
      resumeId
    );

    // Build safe filename
    const fullName = resumeData.personalInfo?.fullName?.trim() || 'resume';
    const safeName = fullName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const filename = `${safeName}-resume.pdf`;

    // Send PDF with Cloudinary URL in headers
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
      'X-Pdf-Url': pdfUrl,
      'X-Pdf-PublicId': pdfPublicId,
    });

    res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
};
