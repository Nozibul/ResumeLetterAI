/**
 * @file app.js
 * @author Nozibul Islams
 */

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const { requestLogger } = require('./shared/utils/logger');
const routes = require('./routes');
const { getHealthStatus } = require('./shared/health/health.controller');
// const { rateLimiter } = require('./shared/middleware/rateLimiter');
const corsOptions = require('./shared/config/cors.config');
const errorHandler = require('./shared/middleware/errorHandler');
const { notFoundHandler } = require('./shared/middleware/notFoundHandle');


// Initialize Express app
const app = express();

// ====================================
// SECURITY MIDDLEWARE
// ====================================
// helmet: Sets various HTTP headers for security, Protects against: XSS, clickjacking, MIME sniffing, etc.
app.use(helmet());

// ====================================
// CORS CONFIGURATION
// ====================================
// Configure CORS properly for production
app.use(cors(corsOptions));

// ====================================
// BODY PARSING MIDDLEWARE
// ====================================
// Parse JSON bodies (limit prevents DoS attacks)
app.use(express.json({ limit: '5mb' }));

//size logging middleware
app.use((req, _, next) => {
  if (req.headers['content-length']) {
    const bytes = parseInt(req.headers['content-length']);
    const kb = (bytes / 1024).toFixed(2);
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    console.log(`Request size: ${kb} KB | ${mb} MB`);
  }
  next();
});

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true, limit: '3mb' }));

// ====================================
// COMPRESSION
// ====================================
// Compress all responses (reduces bandwidth usage)
app.use(compression());

// ====================================
// LOGGING MIDDLEWARE
// ====================================
// Log all HTTP requests (from your logger utility)
app.use(requestLogger);

// ====================================
// HEALTH CHECK ENDPOINT
// ====================================
// Simple health check (before routes, no auth needed)
app.get('/health', getHealthStatus);

// ====================================
// API ROUTES
// ====================================
app.use('/api', routes);

// ====================================
// ROOT ENDPOINT HELTH CHECK
// ====================================
// tech-level health info fordeveloper, monitoring systems
app.get('/', (_, res) => {
  res.json({
    name: 'ResumeLetterAI API',
    version: process.env.APP_VERSION || '1.0.0',
    status: 'running',
    docs: '/api/docs',
    timestamp: new Date().toISOString(),
  });
});

// ====================================
// 404 HANDLER (using shared middleware)
// ====================================
app.use(notFoundHandler);

// ====================================
// Global ERROR HANDLER (using shared middleware)
// ====================================
app.use(errorHandler);

module.exports = app;
