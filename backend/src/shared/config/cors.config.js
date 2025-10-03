/**
 * @file cors.config.js
 * @author Nozibul Islams
 */

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Get allowed origins from environment variable
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000'];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log rejected origin for debugging
    console.warn(`❌ CORS blocked: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },

  credentials: true, // Allow cookies/auth headers
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;
