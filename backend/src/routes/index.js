/**
 * @file routes/index.js
 * @description Main route aggregator
 * @module routes
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('../modules/auth/routes/authRoutes');
const tokenRoutes = require('../modules/auth/routes/tokenRoutes');
// const templateRoutes = require('./templateRoutes');
// const userRoutes = require('./userRoutes');

// ==========================================
// API INFO ENDPOINTS
// ==========================================

/**
 * GET /api/v1/
 * @description API welcome message with available endpoints
 */
router.get('/', (_, res) => {
  res.json({
    success: true,
    message: 'Welcome to ResumeLetterAI API',
    version: process.env.APP_VERSION || '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      token: '/api/v1/token',
      users: '/api/v1/users',
      templates: '/api/v1/templates',
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/v1/docs
 * @description API documentation links
 */
router.get('/docs', (_, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    documentation: {
      swagger: '/api/v1/swagger',
      postman: '/api/v1/postman-collection',
    },
  });
});

/**
 * GET /api/v1/health
 * @description Health check endpoint
 */
router.get('/health', (_, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ==========================================
// ROUTE MODULES
// ==========================================

/**
 * Authentication routes
 * @path /api/v1/auth
 */
router.use('/auth', authRoutes);

/**
 * Token management routes
 * @path /api/v1/token
 */
router.use('/token', tokenRoutes);

/**
 * User routes
 * @path /api/v1/users
 */
// router.use('/users', userRoutes);

/**
 * Template routes
 * @path /api/v1/templates
 */
// router.use('/templates', templateRoutes);

module.exports = router;
