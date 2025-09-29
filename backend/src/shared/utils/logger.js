const winston = require('winston');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');


// ====================================================================
// STEP 1: Logs Directory Setup
// ====================================================================
const logsDir = path.join(__dirname, '../../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}


// ====================================================================
// STEP 2: Winston Logger Configuration
// ====================================================================
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  
  // Default metadata
  defaultMeta: {
    service: process.env.APP_NAME || 'resumeletterai-api',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Initially empty, পরে conditionally add করবো
  transports: []
})


// ====================================================================
// STEP 3: File Transports
// ====================================================================

// Environment variable দিয়ে control করা যাবে
if (process.env.LOG_TO_FILE !== 'false') {
  
  // Error Log File - শুধু errors (important for debugging)
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: 20971520,  // 20MB - এর বেশি হলে নতুন file create হবে
    maxFiles: 5,        // সর্বোচ্চ 5 টা file রাখবে (space save করে)
    tailable: true      // Latest file সবসময় same name এ থাকবে
  }));

  // Combined Log File 
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 20971520,
    maxFiles: 5,
    tailable: true
  }));
}

// ====================================================================
// STEP 4: Console Transport (Development এর জন্য useful)
// ====================================================================
if (process.env.LOG_TO_CONSOLE !== 'false') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      // Console color add (error = red, info = green)
      winston.format.colorize(),
      
      // Custom format: for readable logs
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        // Extra metadata থাকলে pretty print করবে
        const metaKeys = Object.keys(meta).filter(key => 
          !['service', 'version', 'environment'].includes(key)
        );
        
        if (metaKeys.length > 0) {
          const metaStr = JSON.stringify(
            metaKeys.reduce((obj, key) => ({ ...obj, [key]: meta[key] }), {}),
            null,
            2
          );
          log += `\n${metaStr}`;
        }
        
        return log;
      })
    )
  }));
}

// ====================================================================
// STEP 5: Request Logger Middleware
// ====================================================================
/**
 * Every HTTP request are track
 * Usage: app.use(requestLogger);
 */
const requestLogger = (req, res, next) => {
  // Unique ID: same request এর all logs get combined
  req.traceId = crypto.randomUUID();
  
  // Request start time
  const startTime = Date.now();
  
  // Response finished হলে log করবে
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Status code অনুযায়ী log level ঠিক করবে
    // 500+ = error (red), 400+ = warn (yellow), 200+ = info (green)
    let logLevel = 'info';
    if (res.statusCode >= 500) {
      logLevel = 'error';
    } else if (res.statusCode >= 400) {
      logLevel = 'warn';
    }
    
    // Log entry
    logger[logLevel]({
      type: 'request_complete',
      method: req.method,                    // GET, POST, etc.
      url: req.originalUrl || req.url,       // /api/users
      statusCode: res.statusCode,            // 200, 404, 500
      duration: `${duration}ms`,             // 150ms
      traceId: req.traceId,                  // abc-123-def
      userId: req.user?.userId || req.user?._id,  // Logged-in user
      userAgent: req.get('User-Agent'),      // Browser info
      ip: req.ip                             // User IP address
    });
  });
  
  // Response error হলে log করবে (network issues, etc.)
  res.on('error', (error) => {
    logger.error({
      type: 'request_error',
      method: req.method,
      url: req.originalUrl || req.url,
      traceId: req.traceId,
      error: error.message,
      stack: error.stack
    });
  });
  
  next();
};

// ====================================================================
// STEP 6: Error Logging Helper
// ====================================================================
const logError = (error, context = {}) => {
  logger.error({
    type: 'application_error',
    message: error.message,    // "Database connection failed"
    stack: error.stack,        // Full error stack trace
    code: error.code,          // Error code (if any)
    ...context                 // Extra info you provide
  });
};

// ====================================================================
// STEP 7: Security Event Logger
// ====================================================================
/**
 * Authentication/Authorization events track করো
 * Example:
 *   logSecurityEvent('failed_login', userId, { ip: req.ip });
 */
const logSecurityEvent = (event, userId, details = {}) => {
  logger.warn({
    type: 'security_event',
    event,                              // 'failed_login', 'unauthorized_access'
    userId,                             // 'user_123'
    timestamp: new Date().toISOString(), // ISO format timestamp
    ...details                           // Extra context
  });
};

// ====================================================================
// EXPORTS
// ====================================================================
module.exports = {
  logger,
  requestLogger,
  logError,
  logSecurityEvent
};