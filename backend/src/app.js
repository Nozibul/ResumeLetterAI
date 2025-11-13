/**
 * @file app.js
 * @description Express application configuration and middleware setup
 * @author Nozibul Islam
 */

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const cookieParser = require('cookie-parser');
const YAML = require('yamljs');
const { requestLogger } = require('./shared/utils/logger');
const routes = require('./routes');
const { getHealthStatus } = require('./shared/health/health.controller');
const corsOptions = require('./shared/config/cors.config');
const errorHandler = require('./shared/middleware/errorHandler');
const { notFoundHandler } = require('./shared/middleware/notFoundHandle');
// const { rateLimiter } = require('./shared/middleware/rateLimiter');

// Load Swagger documentation
const swaggerDocument = YAML.load('./docs/api/openapi.yaml');

// Initialize Express app
const app = express();

// ====================================
// SECURITY MIDDLEWARE
// ====================================
// Helmet: Sets various HTTP headers for security
// Protects against: XSS, clickjacking, MIME sniffing, etc.
app.use(helmet());

// ====================================
// CORS CONFIGURATION
// ====================================
// Configure CORS properly for production
app.use(cors(corsOptions));

// ====================================
// COOKIE PARSER MIDDLEWARE
// ====================================
app.use(cookieParser());

// ====================================
// BODY PARSING MIDDLEWARE
// ====================================
// Parse JSON bodies (limit prevents DoS attacks)
app.use(express.json({ limit: '5mb' }));

// Request size logging middleware (for debugging/monitoring)
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
// API DOCUMENTATION (Swagger UI)
// ====================================
// Serves interactive API documentation at /api-docs endpoint
// Access at: http://localhost:3000/api-docs
// Only available in development/staging environments
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// ====================================
// API ROUTES
// ====================================
app.use('/api', routes);

// ====================================
// ROOT ENDPOINT (API INFO)
// ====================================
// Provides basic API information for developers and monitoring systems
app.get('/', (_, res) => {
  res.json({
    name: 'ResumeLetterAI API',
    version: process.env.APP_VERSION || '1.0.0',
    status: 'running',
    docs: process.env.NODE_ENV !== 'production' ? '/api-docs' : null,
    health: '/health',
    timestamp: new Date().toISOString(),
  });
});

// ====================================
// 404 HANDLER (using shared middleware)
// ====================================
app.use(notFoundHandler);

// ====================================
// GLOBAL ERROR HANDLER (using shared middleware)
// ====================================
app.use(errorHandler);

module.exports = app;
