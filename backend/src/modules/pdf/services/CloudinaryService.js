/**
 * @file CloudinaryService.js
 * @description Uploads PDF buffer to Cloudinary, returns secure URL and publicId.
 *              PDF stored under 'resumes/' folder in Cloudinary.
 * @module modules/pdf/services/CloudinaryService
 * @author Nozibul Islam
 */

'use strict';

const { Readable } = require('stream');
const cloudinary = require('../../../shared/config/cloudinary');

// ==========================================
// HELPERS
// ==========================================

/**
 * Convert Buffer to Readable stream
 * Required by Cloudinary upload_stream API
 * @param {Buffer} buffer
 * @returns {Readable}
 */
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// ==========================================
// MAIN EXPORT
// ==========================================

/**
 * Upload PDF buffer to Cloudinary.
 *
 * @param {Buffer} pdfBuffer  - PDF buffer from PdfService
 * @param {string} fullName   - User's full name (for filename)
 * @returns {Promise<{ pdfUrl: string, pdfPublicId: string }>}
 * @throws {Error} If upload fails
 */
exports.uploadPdf = (pdfBuffer, userId, resumeId) => {
  return new Promise((resolve, reject) => {
    const publicId = `${userId}/${resumeId}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw', // PDF is raw, not image
        folder: 'resumes', // Cloudinary: resumes/{userId}/{resumeId}
        public_id: publicId,
        format: 'pdf',
        overwrite: true, // Same resume gets replaced on regeneration
      },
      (error, result) => {
        if (error) {
          return reject(
            new Error(`Cloudinary upload failed: ${error.message}`)
          );
        }

        resolve({
          pdfUrl: result.secure_url, // HTTPS URL — permanent
          pdfPublicId: result.public_id, // For future delete/replace
        });
      }
    );

    // Pipe buffer into Cloudinary upload stream
    bufferToStream(pdfBuffer).pipe(uploadStream);
  });
};

/**
 * Delete PDF from Cloudinary by publicId.
 * Used when user deletes resume or regenerates PDF.
 *
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<void>}
 */
exports.deletePdf = async (publicId) => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: 'raw',
  });
};
