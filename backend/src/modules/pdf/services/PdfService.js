/**
 * @file PdfService.js
 * @description Generates PDF buffer from resume data using Puppeteer.
 * @module modules/pdf/services/PdfService
 * @author Nozibul Islam
 */

'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const { buildResumeHTML } = require('./HtmlBuilderService');
const { buildInlineStyles } = require('./StyleService');

const TEMPLATE_PATH = path.resolve(
  __dirname,
  '../../../templates/resume-template.html'
);
const CSS_PATH = path.resolve(__dirname, '../../../assets/output.css');

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

// Cached after first read — server restart required after template changes
let _templateHTML = null;
let _tailwindCSS = null;

const getTemplate = () => {
  if (_templateHTML) return _templateHTML;
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`PdfService: Template not found at ${TEMPLATE_PATH}`);
  }
  _templateHTML = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  return _templateHTML;
};

const getTailwindCSS = () => {
  if (_tailwindCSS) return _tailwindCSS;
  if (!fs.existsSync(CSS_PATH)) {
    throw new Error(`PdfService: CSS not found at ${CSS_PATH}`);
  }
  const cssContent = fs.readFileSync(CSS_PATH, 'utf-8');
  _tailwindCSS = `<style>${cssContent}</style>`;
  return _tailwindCSS;
};

const resolveConditionals = (html, conditions) => {
  let result = html;
  Object.entries(conditions).forEach(([key, value]) => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (value) {
      result = result.replace(
        new RegExp(
          `\\{\\{#if ${escapedKey}\\}\\}([\\s\\S]*?)\\{\\{\\/if\\}\\}`,
          'g'
        ),
        '$1'
      );
    } else {
      result = result.replace(
        new RegExp(
          `\\{\\{#if ${escapedKey}\\}\\}[\\s\\S]*?\\{\\{\\/if\\}\\}`,
          'g'
        ),
        ''
      );
    }
  });
  return result;
};

const injectPlaceholders = (templateHTML, vars) => {
  let html = templateHTML;

  html = html.replace('{{tailwindCSS}}', vars.tailwindCSS);
  html = html.replace('{{inlineStyles}}', vars.inlineStyles);
  html = html.replace('{{{sectionsHTML}}}', vars.sectionsHTML);

  const p = vars.personalInfo;

  if (p) {
    html = html.replace('{{fullName}}', p.fullName);
    html = html.replace('{{personalInfo.fullName}}', p.fullName);
    html = html.replace('{{personalInfo.jobTitle}}', p.jobTitle || '');
    html = html.replace('{{personalInfo.email}}', p.email || '');
    html = html.replace('{{personalInfo.phone}}', p.phone || '');
    html = html.replace('{{personalInfo.location}}', p.location || '');
    html = html.replace('{{personalInfo.linkedin}}', p.linkedin || '');
    html = html.replace('{{personalInfo.github}}', p.github || '');
    html = html.replace('{{personalInfo.portfolio}}', p.portfolio || '');

    html = resolveConditionals(html, {
      personalInfo: !!p,
      'personalInfo.jobTitle': !!p.jobTitle,
      'personalInfo.hasContact': p.hasContact,
      'personalInfo.email': !!p.email,
      'personalInfo.email_and_phone': p.email_and_phone,
      'personalInfo.phone': !!p.phone,
      'personalInfo.contact_and_location': p.contact_and_location,
      'personalInfo.location': !!p.location,
      'personalInfo.hasSocial': p.hasSocial,
      'personalInfo.linkedin': !!p.linkedin,
      'personalInfo.linkedin_and_github': p.linkedin_and_github,
      'personalInfo.github': !!p.github,
      'personalInfo.social_and_portfolio': p.social_and_portfolio,
      'personalInfo.portfolio': !!p.portfolio,
    });
  } else {
    html = html.replace(/\{\{#if personalInfo\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  return html;
};

exports.generatePdf = async (resumeData, customization) => {
  let browser = null;

  try {
    const { personalInfo, sectionsHTML } = buildResumeHTML(resumeData);
    const inlineStyles = buildInlineStyles(customization);
    const templateHTML = getTemplate();
    const tailwindCSS = getTailwindCSS();

    const finalHTML = injectPlaceholders(templateHTML, {
      tailwindCSS,
      inlineStyles,
      personalInfo,
      sectionsHTML,
    });

    browser = await puppeteer.launch(BROWSER_OPTIONS);
    const page = await browser.newPage();
    await page.setContent(finalHTML, { waitUntil: 'domcontentloaded' });
    const pdfBuffer = await page.pdf(PDF_OPTIONS);

    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
