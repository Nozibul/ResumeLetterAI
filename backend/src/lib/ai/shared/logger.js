/**
 * @file logger.js
 * @description Thin adapter over this project's real Winston logger
 * (shared/utils/logger.js at the project root) -- NOT a separate logging
 * system. lib/ai/* files import from here (rather than reaching to the
 * root logger directly) so this module stays the one place that knows the
 * real logger's exact location and calling convention.
 *
 * CORRECTION: an earlier version of this file was a standalone
 * console-wrapping logger, written without realizing this project already
 * has a full Winston setup (JSON format, file rotation with rotation caps,
 * service/version/environment metadata). That version is replaced here --
 * it was an unnecessary reinvention.
 *
 * Winston's logger.info/warn/error expect EITHER a string, OR a single
 * object with a `message` field plus arbitrary structured metadata (see
 * shared/utils/logger.js's own established house style, e.g. in
 * shared/config/redis.js) -- NOT console.log's variadic
 * (string, arg1, arg2, ...) calling convention. Every helper here enforces
 * the (message, meta) shape so callers can't accidentally fall back into
 * the console.log style, which Winston would silently mishandle (extra
 * positional args are dropped -- this project's format pipeline has no
 * winston.format.splat()).
 *
 * @module lib/ai/shared/logger
 * @author Nozibul Islam
 * @version 3.0.0
 */

const { logger: winstonLogger } = require('../../../shared/utils/logger');

const info = (message, meta = {}) => winstonLogger.info({ message, ...meta });
const warn = (message, meta = {}) => winstonLogger.warn({ message, ...meta });
const error = (message, meta = {}) => winstonLogger.error({ message, ...meta });

/**
 * Structured record of a single provider attempt (stage 1 or stage 2),
 * success or failure. Every orchestrator log call for a provider attempt
 * goes through this, giving consistent fields (stage/provider/outcome/
 * durationMs) that a future metrics/circuit-breaker layer (step 14) can
 * read without re-deriving them from prose log strings. Winston's JSON
 * format transport already serializes this to structured JSON in
 * combined.log/error.log -- no manual JSON.stringify needed, unlike the
 * console-based version this replaces.
 *
 * @param {object} record
 * @param {'extraction'|'writing'} record.stage
 * @param {string} record.provider
 * @param {'success'|'failure'} record.outcome
 * @param {number} record.durationMs
 * @param {string} [record.errorType]
 * @param {string} [record.detail]
 * @returns {object} the structured meta that was logged (handy for tests)
 */
const logProviderAttempt = ({
  stage,
  provider,
  outcome,
  durationMs,
  errorType,
  detail,
}) => {
  const meta = {
    type: 'provider_attempt',
    stage,
    provider,
    outcome,
    durationMs,
    ...(errorType ? { errorType } : {}),
    ...(detail ? { detail } : {}),
  };
  const message = `[${stage}] ${provider}: ${outcome}`;

  if (outcome === 'success') {
    winstonLogger.info({ message, ...meta });
  } else {
    winstonLogger.error({ message, ...meta });
  }

  return meta;
};

module.exports = { info, warn, error, logProviderAttempt };
