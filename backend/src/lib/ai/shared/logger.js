/**
 * @file logger.js
 * @description Minimal logging interface. Wraps console for now -- step 11
 * (Logging + Metrics) swaps the internals without touching any call site.
 * @module lib/ai/shared/logger
 */
const logger = {
  info: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};
module.exports = logger;
