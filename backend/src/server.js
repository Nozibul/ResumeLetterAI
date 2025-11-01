/**
 * @file server.js
 * @description Production-ready server bootstrap for ResumeLetterAI API
 * @author Nozibul Islam
 */

require('dotenv').config({ path: '.env.local' });

const app = require('./app');
const Database = require('./shared/config/database');
const { initRedis, disconnect } = require('./shared/config/redis');
const { logger } = require('./shared/utils/logger');

// ====================================
// ENVIRONMENT VARIABLES
// ====================================
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const APP_NAME = process.env.APP_NAME || 'ResumeLetterAI API';

// Configurable timeouts and thresholds
const SHUTDOWN_TIMEOUT = parseInt(process.env.SHUTDOWN_TIMEOUT_MS) || 30000;
const MEMORY_THRESHOLD = parseInt(process.env.MEMORY_THRESHOLD_MB) || 800;
const MEMORY_CHECK_INTERVAL = parseInt(process.env.MEMORY_CHECK_INTERVAL_MS) || 60000;

// Server instance
let server;
let memoryMonitorInterval;

// ====================================
// STARTUP FUNCTION
// ====================================
async function startServer() {
  const startTime = Date.now();

  try {
    logger.info('🚀 Starting server initialization...');
    logger.info(`📦 Environment: ${NODE_ENV}`);
    logger.info(`🏷️ App Name: ${APP_NAME}`);
    logger.info(`🔧 Node Version: ${process.version}`);
    logger.info(`💻 Platform: ${process.platform}`);
    logger.info(`🆔 Process ID: ${process.pid}`);

    // ============================================
    // STEP 1: Connect to MongoDB
    // ============================================
    logger.info('📊 Connecting to MongoDB...');
    await Database.connect();
    logger.info('MongoDB connected successfully');

    // Check database health
    const dbHealth = await Database.healthCheck();
    logger.info('Database health:', dbHealth);

    // ============================================
    // STEP 2: Connect to Redis
    // ============================================
    logger.info('Connecting to Redis...');
    await initRedis();
    logger.info('Redis connected successfully');

    // ============================================
    // STEP 3: Start HTTP Server
    // ============================================
    logger.info('Starting HTTP server...');
    server = app.listen(PORT, () => {
      const startupTime = Date.now() - startTime;

      logger.info('='.repeat(40));
      logger.info(`✨ ${APP_NAME} is running!`);
      logger.info(`🌐 Server URL: http://localhost:${PORT}`);
      logger.info(`📝 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🔐 Environment: ${NODE_ENV}`);
      logger.info(`⚡ Startup completed in ${startupTime}ms`);
      logger.info(`⏰ Started at: ${new Date().toISOString()}`);
      logger.info('='.repeat(50));
    });

    // Handle server errors (e.g., port already in use)
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use`);
        logger.error(`💡 Try a different port or stop the process using port ${PORT}`);
      } else {
        logger.error('❌ Server error:', error.message);
      }
      cleanup().then(() => process.exit(1));
    });

    // ============================================
    // STEP 4: Setup Graceful Shutdown
    // ============================================
    setupGracefulShutdown();

    // ============================================
    // STEP 5: Production Monitoring
    // ============================================
    if (NODE_ENV === 'production') {
      startMemoryMonitoring();
    }
  } catch (error) {
    logger.error('💥 Server startup failed:', error);
    logger.error('Stack trace:', error.stack);

    // Cleanup and exit
    await cleanup();
    process.exit(1);
  }
}

// ====================================
// GRACEFUL SHUTDOWN
// ====================================
function setupGracefulShutdown() {
  // Shutdown signals to handle
  const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);

      // Stop memory monitoring
      if (memoryMonitorInterval) {
        clearInterval(memoryMonitorInterval);
      }

      // Stop accepting new requests
      if (server) {
        server.close(async () => {
          logger.info('✅ HTTP server closed');
          await cleanup();
          logger.info('👋 Graceful shutdown completed');
          process.exit(0);
        });

        // Force close after configured timeout
        setTimeout(() => {
          logger.error(`❌ Forced shutdown after ${SHUTDOWN_TIMEOUT}ms timeout`);
          process.exit(1);
        }, SHUTDOWN_TIMEOUT);
      } else {
        await cleanup();
        process.exit(0);
      }
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    logger.error('💥 Uncaught Exception:', error);
    logger.error('Stack:', error.stack);
    await cleanup();
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    logger.error('💥 Unhandled Rejection at:', promise);
    logger.error('Reason:', reason);

    if (NODE_ENV === 'production') {
      // Log but don't crash in production
      logger.error('Continuing despite unhandled rejection...');
    } else {
      await cleanup();
      process.exit(1);
    }
  });
}

// ====================================
// CLEANUP FUNCTION
// ====================================
async function cleanup() {
  logger.info('🧹 Starting cleanup...');

  // Stop memory monitoring
  if (memoryMonitorInterval) {
    clearInterval(memoryMonitorInterval);
  }

  const cleanupTasks = [
    {
      name: 'MongoDB',
      task: async () => {
        await Database.disconnect();
        logger.info('✅ MongoDB disconnected');
      },
    },
    {
      name: 'Redis',
      task: async () => {
        await disconnect();
        logger.info('✅ Redis disconnected');
      },
    },
  ];

  // Execute all cleanup tasks
  for (const { name, task } of cleanupTasks) {
    try {
      await task();
    } catch (error) {
      logger.error(`❌ ${name} cleanup failed:`, error.message);
    }
  }

  logger.info('✅ Cleanup completed');
}

// ====================================
// MEMORY MONITORING (Production)
// ====================================
function startMemoryMonitoring() {
  memoryMonitorInterval = setInterval(() => {
    const memUsage = process.memoryUsage();
    const memoryInfo = {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
    };

    // Log memory usage
    logger.debug('📊 Memory usage:', memoryInfo);

    // Alert if memory usage is high
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    if (heapUsedMB > MEMORY_THRESHOLD) {
      logger.warn(
        `⚠️ High memory usage: ${Math.round(heapUsedMB)}MB (threshold: ${MEMORY_THRESHOLD}MB)`
      );
    }
  }, MEMORY_CHECK_INTERVAL);
}

// ====================================
// START THE SERVER
// ====================================
startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

// Export for testing
module.exports = { startServer, cleanup };
