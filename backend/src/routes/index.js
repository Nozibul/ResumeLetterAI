const express = require('express');
const router = express.Router();

// Import route modules
// const userRoutes = require('./userRoutes');
// const authRoutes = require('./authRoutes');
// const templateRoutes = require('./templateRoutes');

/**
 * Root API endpoint
 */
router.get('/', (_, res) => {
  res.json({
    success: true,
    message: 'Welcome to ResumeLetterAI API',
    version: process.env.APP_VERSION || '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      templates: '/api/v1/templates',
      health: '/healthz',
      docs: '/api/v1/docs'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * API Documentation endpoint
 */
router.get('/docs', (_, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    documentation: {
      swagger: '/api/v1/swagger',
      postman: '/api/v1/postman-collection'
    }
  });
});

/**
 * Register all route modules here
 */
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/templates', templateRoutes);

// Example route for testing
router.get('/test', (_, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

module.exports = router;