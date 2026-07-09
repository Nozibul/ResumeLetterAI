/**
 * @file lib/fileExtractor.js
 * @description Extracts plain text from an uploaded resume file (PDF, DOCX, TXT)
 * @module lib/fileExtractor
 * @author Nozibul Islam
 */

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const AppError = require('../shared/utils/AppError');

const SUPPORTED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'text/plain': 'txt',
};

const extractFromPdf = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text;
};

const extractFromDocx = async (buffer) => {
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
};

const extractFromTxt = (buffer) => buffer.toString('utf-8');

/**
 * Extracts plain text from an uploaded resume file.
 * Called from the controller BEFORE SSE headers are set, so any
 * extraction failure returns a normal JSON error response.
 *
 * @param {Express.Multer.File} file - populated by multer (memory storage)
 * @returns {Promise<string>} extracted, trimmed plain text
 */
const extractTextFromFile = async (file) => {
  if (!file) {
    throw new AppError('No file uploaded', 400);
  }

  const fileType = SUPPORTED_MIME_TYPES[file.mimetype];

  if (!fileType) {
    throw new AppError(
      'Unsupported file type. Please upload a PDF, DOCX, or TXT file.',
      400
    );
  }

  let text;

  try {
    switch (fileType) {
      case 'pdf':
        text = await extractFromPdf(file.buffer);
        break;
      case 'docx':
        text = await extractFromDocx(file.buffer);
        break;
      case 'txt':
        text = extractFromTxt(file.buffer);
        break;
    }
  } catch (err) {
    // Corrupted/unreadable file — never let the raw parser error leak out
    throw new AppError(
      'Could not read the uploaded file. It may be corrupted or password-protected.',
      400
    );
  }

  const trimmed = (text || '').trim();

  if (trimmed.length < 100) {
    throw new AppError(
      'Could not extract enough readable text from this file. Please try a different file or paste your resume text instead.',
      400
    );
  }

  return trimmed;
};

module.exports = { extractTextFromFile, SUPPORTED_MIME_TYPES };
