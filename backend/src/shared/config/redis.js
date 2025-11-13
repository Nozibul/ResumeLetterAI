const Redis = require('ioredis');
const { logger } = require('../utils/logger');

// ====================================================================
// Redis Configuration
// ====================================================================
const redisConfig = {
  // Basic connection
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,

  // Connection options
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES) || 3,
  retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY) || 100,
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT) || 20000,

  // Connect immediately (production best practice)
  lazyConnect: false,

  // ================================================================
  // Retry Strategy: Exponential backoff with max delay
  // ================================================================
  retryStrategy: (times = 0) => {
    // Exponential backoff: 50ms, 100ms, 200ms, 400ms... max 2000ms
    const delay = Math.min(times * 50, 2000);

    logger.warn({
      type: 'redis_retry',
      attempt: times,
      delay: `${delay}ms`,
      message: `Retrying Redis connection (attempt ${times})`,
    });

    // Stop retrying after 10 attempts
    if (times > 10) {
      logger.error({
        type: 'redis_connection',
        status: 'failed',
        message: 'Redis connection failed after 10 attempts',
      });
      return null; // Stop retrying
    }

    return delay;
  },

  // ================================================================
  // Reconnect on specific errors
  // ================================================================

  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      logger.warn({
        type: 'redis_reconnect',
        reason: 'READONLY error - master-slave failover detected',
      });
      return true; // Reconnect
    }
    return false; // Don't reconnect for other errors
  },
};

// ====================================================================
// Create Redis Client
// ====================================================================
const redis = new Redis(redisConfig);

// ====================================================================
// Connection Event Listeners
// ====================================================================

// Connect: Initial connection attempt
redis.on('connect', () => {
  logger.info({
    message: 'Connecting to Redis...',
    type: 'redis_connection',
    status: 'connecting',
    host: redisConfig.host,
    port: redisConfig.port,
    db: redisConfig.db,
  });
});

// Ready: Redis is ready to accept commands (most important event)
redis.on('ready', () => {
  logger.info({
    message: 'Redis is ready to accept commands',
    type: 'redis_connection',
    status: 'ready',
    environment: process.env.NODE_ENV,
  });
});

// Error: Connection or command errors
redis.on('error', (error) => {
  logger.error({
    message: 'Redis connection error',
    type: 'redis_connection',
    status: 'error',
    error: error.message,
    code: error.code,
  });
});

// Close: Connection closed (may reconnect)
redis.on('close', () => {
  logger.warn({
    message: 'Redis connection closed',
    type: 'redis_connection',
    status: 'closed',
  });
});

// Reconnecting: Attempting to reconnect
redis.on('reconnecting', (delay) => {
  logger.info({
    message: `Reconnecting to Redis in ${delay}ms`,
    type: 'redis_connection',
    status: 'reconnecting',
    delay: `${delay}ms`,
  });
});

// End: Connection ended permanently (won't reconnect)
redis.on('end', () => {
  logger.warn({
    message: 'Redis connection ended permanently',
    type: 'redis_connection',
    status: 'ended',
  });
});

// ====================================================================
// Helper Functions (Essential Only)
// ====================================================================
const getCache = async (key) => {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error({
      type: 'cache_error',
      operation: 'get',
      key,
      error: error.message,
    });
    return null; // Return null on error (graceful degradation)
  }
};

//  Set cached data with TTL
const setCache = async (key, value, ttl = 300) => {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    return true; // Success
  } catch (error) {
    logger.error({
      type: 'cache_error',
      operation: 'set',
      key,
      error: error.message,
    });
    return false;
  }
};

// Delete cached data
const deleteCache = async (key) => {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    logger.error({
      type: 'cache_error',
      operation: 'delete',
      key,
      error: error.message,
    });
    return false;
  }
};

// Clear multiple cache keys by pattern
const clearCacheByPattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info({
        type: 'cache_clear',
        pattern,
        keysDeleted: keys.length,
      });
    }
    return keys.length;
  } catch (error) {
    logger.error({
      type: 'cache_error',
      operation: 'clearPattern',
      pattern,
      error: error.message,
    });
    return 0;
  }
};

// Redis health check for monitoring
const healthCheck = async () => {
  try {
    const startTime = Date.now();
    await redis.ping();
    const duration = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime: `${duration}ms`,
      host: redisConfig.host,
      port: redisConfig.port,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
};

// Graceful shutdown - close Redis connection cleanly
const disconnect = async () => {
  try {
    await redis.quit(); // Redis connection সুন্দরভাবে close করো
    logger.info({
      type: 'redis_connection',
      status: 'disconnected',
      message: 'Redis connection closed gracefully',
    });
  } catch (error) {
    logger.error({
      type: 'redis_connection',
      status: 'disconnect_failed',
      error: error.message,
    });
    process.exit(1); // Force exit on failure
  }
};

// ====================================================================
// Graceful Shutdown Handlers
// ====================================================================

// SIGINT: Ctrl+C pressed
process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing Redis connection...');
  await disconnect();
  process.exit(0);
});

// SIGTERM: Process termination (production deployments)
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing Redis connection...');
  await disconnect();
  process.exit(0);
});

// ====================================================================
// Initialize Redis (for server.js compatibility)
// ====================================================================
const initRedis = async () => {
  // Redis already connects automatically (lazyConnect: false)
  // But we can wait for 'ready' event to ensure connection
  return new Promise((resolve, reject) => {
    if (redis.status === 'ready') {
      resolve();
    } else {
      redis.once('ready', resolve);
      redis.once('error', reject);

      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Redis connection timeout'));
      }, 10000);
    }
  });
};

// ====================================================================
// Exports
// ====================================================================
module.exports = {
  redis, // Raw Redis client (for advanced usage)
  getCache, // Get cached data
  setCache, // Set cached data with TTL
  deleteCache, // Delete single cache key
  clearCacheByPattern, // Delete multiple keys by pattern
  healthCheck, // Health check for monitoring
  disconnect, // Graceful shutdown
  initRedis,
};
