/**
 * @file database.js
 * @author Nozibul Islams
 */

const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

class Database {
  // ====================================================================
  // Connect to MongoDB
  // ====================================================================
  static async connect() {
    try {
      // Determine MongoDB URI (test vs production)
      const mongoUri =
        process.env.NODE_ENV === 'test' ? process.env.MONGODB_TEST_URI : process.env.MONGODB_URI;

      // Validation: URI must be defined
      if (!mongoUri) {
        throw new Error('MongoDB URI is not defined in environment variables');
      }

      // Connection options from .env
      const options = {
        maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
        serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) || 5000,
        socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT) || 45000,
        family: 4, // Use IPv4 (faster, skip IPv6 attempt)
      };

      // Connect to MongoDB
      const startTime = Date.now();
      await mongoose.connect(mongoUri, options);
      const duration = Date.now() - startTime;

      // Log successful connection
      logger.info({
        type: 'database_connection',
        status: 'connected',
        duration: `${duration}ms`,
        host: mongoose.connection.host,
        database: mongoose.connection.name,
        environment: process.env.NODE_ENV,
      });

      // Setup event listeners for connection monitoring
      this.setupEventListeners();
    } catch (error) {
      // Log connection failure
      logger.error({
        type: 'database_connection',
        status: 'failed',
        error: error.message,
        stack: error.stack,
      });

      // Exit process - can't run without database
      process.exit(1);
    }
  }

  // ====================================================================
  // Setup MongoDB Event Listeners
  // ====================================================================
  static setupEventListeners() {
    // Connected: Initial connection established
    mongoose.connection.on('connected', () => {
      logger.info({
        type: 'database_event',
        event: 'connected',
        host: mongoose.connection.host,
      });
    });

    // Disconnected: Connection lost (may reconnect)
    mongoose.connection.on('disconnected', () => {
      logger.warn({
        type: 'database_event',
        event: 'disconnected',
        message: 'MongoDB connection lost',
      });
    });

    // Error: Connection or query errors
    mongoose.connection.on('error', (error) => {
      logger.error({
        type: 'database_event',
        event: 'error',
        error: error.message,
      });
    });

    // Reconnected: Connection restored after disconnect
    mongoose.connection.on('reconnected', () => {
      logger.info({
        type: 'database_event',
        event: 'reconnected',
        message: 'MongoDB reconnected successfully',
      });
    });

    // Graceful shutdown handlers
    process.on('SIGINT', async () => {
      logger.info('SIGINT received, closing MongoDB connection...');
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, closing MongoDB connection...');
      await this.disconnect();
      process.exit(0);
    });
  }

  // ====================================================================
  // Disconnect from MongoDB (Graceful Shutdown)
  // ====================================================================
  static async disconnect() {
    try {
      await mongoose.connection.close();
      logger.info({
        type: 'database_connection',
        status: 'disconnected',
        message: 'MongoDB connection closed gracefully',
      });
    } catch (error) {
      logger.error({
        type: 'database_connection',
        status: 'disconnect_failed',
        error: error.message,
      });
      throw error; // Re-throw to let caller handle
    }
  }

  // ====================================================================
  // Health Check (for monitoring endpoints)
  // ====================================================================
  static async healthCheck() {
    try {
      const startTime = Date.now();

      // Ping database to check connectivity
      await mongoose.connection.db.admin().ping();

      const duration = Date.now() - startTime;

      return {
        status: 'healthy',
        database: mongoose.connection.name,
        responseTime: `${duration}ms`,
        readyState: this.getReadyStateString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        readyState: this.getReadyStateString(),
      };
    }
  }

  // ====================================================================
  // Get Connection Status
  // ====================================================================
  static getConnectionStatus() {
    return {
      state: this.getReadyStateString(),
      host: mongoose.connection.host,
      database: mongoose.connection.name,
    };
  }

  // ====================================================================
  // Helper: Convert readyState number to string
  // ====================================================================
  static getReadyStateString() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[mongoose.connection.readyState] || 'unknown';
  }
}

module.exports = Database;
