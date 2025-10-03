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
const { rateLimiter } = require('./shared/middleware/rateLimiter');
const { notFoundHandler } = require('./shared/middleware/notFoundHandler');
const corsOptions = require('./shared/config/cors.config');
const errorHandler = require('./shared/middleware/errorHandler');

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
const Database = require('./shared/config/database');
const { healthCheck: redisHealthCheck } = require('./shared/config/redis');

app.get('/health', async (_, res) => {
  try {
    const dbHealth = await Database.healthCheck();
    const redisHealth = await redisHealthCheck();

    const isHealthy = dbHealth.status === 'healthy' && redisHealth.status === 'healthy';
    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbHealth,
        redis: redisHealth,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// ====================================
// API ROUTES
// ====================================
const routes = require('./routes');
app.use('/api', routes);

// ====================================
// ROOT ENDPOINT
// ====================================
app.get('/', (_, res) => {
  res.json({
    name: 'ResumeLetterAI API',
    version: '1.0.0',
    status: 'running',
    docs: '/api/docs',
  });
});

// ====================================
// 404 HANDLER
// ====================================
// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    path: req.originalUrl,
  });
});

app.use(errorHandler);

module.exports = app;
