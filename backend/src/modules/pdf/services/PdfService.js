/**
 * @file PdfService.js
 * @description Generates PDF buffer from resume data using Puppeteer.
 *              Uploads to Cloudinary and returns URL + buffer.
 * @module modules/pdf/services/PdfService
 * @author Nozibul Islam
 */

'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const { buildResumeHTML } = require('./HtmlBuilderService');
const { buildInlineStyles } = require('./StyleService');
const { uploadPdf } = require('./CloudinaryService');

// ==========================================
// FILE PATHS
// ==========================================

const TEMPLATE_PATH = path.resolve(
  __dirname,
  '../../../templates/resume-template.html'
);

const CSS_PATH = path.resolve(__dirname, '../../../assets/tailwind-v3.css');

// ==========================================
// PUPPETEER OPTIONS
// ==========================================

const PDF_OPTIONS = {
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
};

const BROWSER_OPTIONS = {
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ],
};

// ==========================================
// FILE CACHE
// Files are read once and cached in memory.
// Server restart is required after file changes.
// ==========================================

let _templateHTML = null;
let _tailwindCSS = null;

/**
 * Read and cache the HTML template file.
 * @returns {string} Template HTML string
 */
const getTemplate = () => {
  if (_templateHTML) return _templateHTML;
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`PdfService: Template not found at ${TEMPLATE_PATH}`);
  }
  _templateHTML = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  return _templateHTML;
};

/**
 * Read and cache the Tailwind CSS file wrapped in <style> tags.
 * @returns {string} CSS wrapped in <style>...</style>
 */
const getTailwindCSS = () => {
  if (_tailwindCSS) return _tailwindCSS;
  if (!fs.existsSync(CSS_PATH)) {
    throw new Error(`PdfService: CSS not found at ${CSS_PATH}`);
  }
  _tailwindCSS = `<style>${fs.readFileSync(CSS_PATH, 'utf-8')}</style>`;
  return _tailwindCSS;
};

// ==========================================
// SAFE REPLACE
// Uses replaceAll with a function to avoid issues with $ in CSS content.
// Standard String.replace() treats $& $1 etc. as special patterns.
// ==========================================

/**
 * Safely replace all occurrences of a placeholder in an HTML string.
 * @param {string} html - Source HTML
 * @param {string} placeholder - Exact string to find
 * @param {string} value - Replacement value
 * @returns {string} Updated HTML
 */
const safeReplace = (html, placeholder, value) => {
  return html.replaceAll(placeholder, () => value);
};

// ==========================================
// CONDITIONAL RESOLVER
// Resolves {{#if key}}...{{/if}} blocks using manual depth-tracking.
// Regex-based approaches fail on nested blocks — this handles them correctly.
// Keys are sorted by length descending so specific keys resolve before general ones.
// ==========================================

/**
 * Resolve all {{#if key}}...{{/if}} conditionals in an HTML string.
 * Uses bracket depth tracking to correctly handle nested blocks.
 *
 * @param {string} html - HTML with conditional blocks
 * @param {Object} conditions - Map of key → boolean
 * @returns {string} HTML with all conditionals resolved
 */
const resolveConditionals = (html, conditions) => {
  let result = html;

  // Sort by key length descending so more specific keys resolve first
  // e.g. "personalInfo.email_and_phone" before "personalInfo.email"
  const sortedConditions = Object.entries(conditions).sort(
    (a, b) => b[0].length - a[0].length
  );

  let changed = true;
  let passes = 0;

  while (changed && passes < 20) {
    changed = false;
    passes++;

    for (const [key, value] of sortedConditions) {
      const openTag = `{{#if ${key}}}`;
      let idx = result.indexOf(openTag);

      while (idx !== -1) {
        changed = true;

        // Track nesting depth to find the correct matching {{/if}}
        let depth = 1;
        let searchFrom = idx + openTag.length;
        let closeIdx = -1;

        while (depth > 0 && searchFrom < result.length) {
          const nextOpen = result.indexOf('{{#if ', searchFrom);
          const nextClose = result.indexOf('{{/if}}', searchFrom);

          // Malformed template — no closing tag found
          if (nextClose === -1) break;

          if (nextOpen !== -1 && nextOpen < nextClose) {
            // Found a nested opening tag before the next close
            depth++;
            searchFrom = nextOpen + 6;
          } else {
            // Found a closing tag
            depth--;
            if (depth === 0) closeIdx = nextClose;
            searchFrom = nextClose + 7;
          }
        }

        // Skip if no matching close tag found (malformed template)
        if (closeIdx === -1) break;

        const innerContent = result.substring(idx + openTag.length, closeIdx);

        if (value) {
          // Condition true — keep inner content, remove the tags
          result =
            result.substring(0, idx) +
            innerContent +
            result.substring(closeIdx + 7);
        } else {
          // Condition false — remove entire block including content
          result = result.substring(0, idx) + result.substring(closeIdx + 7);
        }

        // Search again from same position after replacement
        idx = result.indexOf(openTag);
      }
    }
  }

  return result;
};

// ==========================================
// PLACEHOLDER INJECTION
// Order matters:
// 1. Inject static blocks (CSS, styles, sections)
// 2. Inject personal info values
// 3. Normalize any multi-line {{#if}} tags
// 4. Resolve conditionals
// ==========================================

/**
 * Inject all dynamic values and resolve conditionals in the template.
 * @param {string} templateHTML - Raw HTML template with placeholders
 * @param {Object} vars - { tailwindCSS, inlineStyles, sectionsHTML, personalInfo }
 * @returns {string} Fully resolved HTML ready for Puppeteer
 */
const injectPlaceholders = (templateHTML, vars) => {
  let html = templateHTML;

  // Step 1: Inject static blocks
  html = safeReplace(html, '{{tailwindCSS}}', vars.tailwindCSS);
  html = safeReplace(html, '{{inlineStyles}}', vars.inlineStyles);
  html = safeReplace(html, '{{{sectionsHTML}}}', vars.sectionsHTML);

  const p = vars.personalInfo;

  if (p) {
    // Step 2: Inject all personal info values BEFORE resolving conditionals
    html = safeReplace(html, '{{fullName}}', p.fullName);
    html = safeReplace(html, '{{personalInfo.fullName}}', p.fullName);
    html = safeReplace(html, '{{personalInfo.jobTitle}}', p.jobTitle || '');
    html = safeReplace(html, '{{personalInfo.email}}', p.email || '');
    html = safeReplace(html, '{{personalInfo.phone}}', p.phone || '');
    html = safeReplace(html, '{{personalInfo.location}}', p.location || '');
    html = safeReplace(html, '{{personalInfo.linkedin}}', p.linkedin || '');
    html = safeReplace(html, '{{personalInfo.github}}', p.github || '');
    html = safeReplace(html, '{{personalInfo.portfolio}}', p.portfolio || '');

    // Step 3: Normalize {{#if key}} tags that may be split across lines
    // due to HTML formatting — ensures consistent single-line tag matching
    html = html.replace(
      /\{\{#if\s+([^}]+)\}\}/g,
      (_, key) => `{{#if ${key.trim()}}}`
    );

    // Step 4: Resolve all conditionals using pre-computed boolean flags
    html = resolveConditionals(html, {
      personalInfo: true,
      'personalInfo.jobTitle': !!p.jobTitle,
      'personalInfo.hasContact': !!p.hasContact,
      'personalInfo.email': !!p.email,
      'personalInfo.email_and_phone': !!p.email_and_phone,
      'personalInfo.phone': !!p.phone,
      'personalInfo.contact_and_location': !!p.contact_and_location,
      'personalInfo.location': !!p.location,
      'personalInfo.hasSocial': !!p.hasSocial,
      'personalInfo.linkedin': !!p.linkedin,
      'personalInfo.linkedin_and_github': !!p.linkedin_and_github,
      'personalInfo.github': !!p.github,
      'personalInfo.social_and_portfolio': !!p.social_and_portfolio,
      'personalInfo.portfolio': !!p.portfolio,
    });
  } else {
    // No personal info — remove the entire personalInfo block
    html = html.replace(/\{\{#if personalInfo\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  return html;
};

// ==========================================
// MAIN EXPORT
// ==========================================

/**
 * Generate a PDF from resume data and upload it to Cloudinary.
 *
 * @param {Object} resumeData    - Full resume data object
 * @param {Object} customization - Font, color, and alignment settings
 * @param {string} userId        - Authenticated user ID
 * @param {string} resumeId      - Resume document ID
 * @returns {Promise<{ pdfBuffer: Buffer, pdfUrl: string, pdfPublicId: string }>}
 */
exports.generatePdf = async (resumeData, customization, userId, resumeId) => {
  let browser = null;

  try {
    // Build HTML sections and personal info from resume data
    const { personalInfo, sectionsHTML } = buildResumeHTML(resumeData);

    // Build dynamic inline styles from user customization
    const inlineStyles = buildInlineStyles(customization);

    // Load cached template and CSS
    const templateHTML = getTemplate();
    const tailwindCSS = getTailwindCSS();

    // Inject all values and resolve conditionals
    const finalHTML = injectPlaceholders(templateHTML, {
      tailwindCSS,
      inlineStyles,
      personalInfo,
      sectionsHTML,
    });

    // Launch Puppeteer and render PDF
    browser = await puppeteer.launch(BROWSER_OPTIONS);
    const page = await browser.newPage();

    // Use domcontentloaded since all CSS is inline — no network requests needed
    await page.setContent(finalHTML, { waitUntil: 'domcontentloaded' });
    const pdfBuffer = await page.pdf(PDF_OPTIONS);

    // Upload rendered PDF to Cloudinary
    const { pdfUrl, pdfPublicId } = await uploadPdf(
      pdfBuffer,
      userId,
      resumeId
    );

    return { pdfBuffer, pdfUrl, pdfPublicId };
  } finally {
    // Always close the browser to prevent memory leaks
    if (browser) {
      await browser.close();
    }
  }
};
