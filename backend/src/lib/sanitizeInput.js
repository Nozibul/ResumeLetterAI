// lib/sanitizeInput.js

const sanitizeHtml = require('sanitize-html');

/**
 * Strips all HTML tags and scripts from user input.
 * Cover letter fields (jobDescription, resumeText) are plain text only —
 * no HTML should ever be stored.
 */
const sanitizeText = (text) => {
  if (!text) return text;
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
};

module.exports = { sanitizeText };
