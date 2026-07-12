/**
 * @file redisStore.js
 * @description RedisStore -- the concrete, production implementation of the
 * CircuitStore contract (circuitStore.js), backed by this project's
 * already-configured ioredis client (shared/config/redis.js at the project
 * root). This is what the running app uses in BOTH dev and prod --
 * createMemoryStore() (circuitStore.js) exists only for unit tests.
 *
 * Deliberately bypasses the existing getCache/setCache helpers
 * (shared/config/redis.js) for `set` specifically: setCache() always
 * applies a TTL (default 300s) even when the caller doesn't ask for one,
 * which would silently violate this module's contract that omitting
 * ttlSeconds means "no expiry." get/delete DO reuse that file's
 * graceful-degradation philosophy (swallow Redis errors, log, return a
 * safe default) -- if Redis itself is unreachable, a circuit breaker built
 * on this store should degrade to "assume healthy, let the request
 * through" rather than block cover-letter generation entirely. Redis is a
 * resilience optimization here, not a hard dependency the core feature
 * should die without.
 *
 * Connection lifecycle is NOT this module's concern -- server.js already
 * awaits initRedis() before the HTTP server starts accepting requests, so
 * by the time any request reaches this store, Redis is already connected
 * (or the app failed to boot at all). No connection-guard code needed here.
 *
 * @module lib/ai/shared/redisStore
 * @author Nozibul Islam
 * @version 1.0.0
 */

const { redis } = require('../../../shared/config/redis');
const logger = require('./logger');

/**
 * @returns {import('./circuitStore').CircuitStore}
 */
const createRedisStore = () => {
  const get = async (key) => {
    try {
      const raw = await redis.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      // Graceful degradation, same philosophy as shared/config/redis.js's
      // getCache() -- a Redis hiccup should never be a harder failure than
      // the AI provider call itself. The caller treats null as "no stored
      // state", which for a circuit breaker means "assume closed."
      logger.error('Redis-store get failed, degrading to null', {
        key,
        errorMessage: err.message,
      });
      return null;
    }
  };

  const set = async (key, value, { ttlSeconds } = {}) => {
    try {
      const payload = JSON.stringify(value);
      if (ttlSeconds) {
        await redis.set(key, payload, 'EX', ttlSeconds);
      } else {
        // No hidden default TTL here -- unlike setCache() elsewhere in this
        // codebase, omitting ttlSeconds means genuinely no expiry, matching
        // circuitStore.js's documented contract exactly.
        await redis.set(key, payload);
      }
    } catch (err) {
      logger.error('Redis-store set failed, swallowed', {
        key,
        errorMessage: err.message,
      });
    }
  };

  const increment = async (key, amount = 1, { ttlSeconds } = {}) => {
    try {
      const next = await redis.incrby(key, amount);
      if (ttlSeconds) {
        // Refreshes the TTL on EVERY increment, by design -- this makes the
        // counter a "failures in the last N seconds" sliding window, not an
        // all-time total. That's the right semantic for a circuit-breaker
        // threshold (recent, consecutive failures), not a bug.
        //
        // Two separate commands (INCRBY then EXPIRE), not one atomic op --
        // Redis has no built-in "increment with TTL" primitive short of a
        // Lua script, which is more machinery than this needs. The gap
        // between the two calls is microseconds; the worst case (process
        // dies in between) just leaves one key without an expiry until
        // manually cleared, not a correctness bug.
        await redis.expire(key, ttlSeconds);
      }
      return next;
    } catch (err) {
      // Degrading to 0 (not throwing) keeps a circuit breaker's failure
      // count from corrupting the request over a transient Redis error --
      // worst case, a real failure undercounts once, not a crash.
      logger.error('Redis-store increment failed, degrading to 0', {
        key,
        errorMessage: err.message,
      });
      return 0;
    }
  };

  const del = async (key) => {
    try {
      await redis.del(key);
    } catch (err) {
      logger.error('Redis-store delete failed, swallowed', {
        key,
        errorMessage: err.message,
      });
    }
  };

  const setIfNotExists = async (key, value, { ttlSeconds } = {}) => {
    try {
      const payload = JSON.stringify(value);
      const result = ttlSeconds
        ? await redis.set(key, payload, 'EX', ttlSeconds, 'NX')
        : await redis.set(key, payload, 'NX');
      return result === 'OK';
    } catch (err) {
      // Degrading to false (not throwing) is the SAFE default here -- if we
      // can't determine whether this call won the claim, treating it as
      // "someone else has it" means we skip this provider and move to the
      // next one, rather than risking a thundering herd against a
      // possibly-still-broken provider.
      logger.error('Redis-store setIfNotExists failed, degrading to false', {
        key,
        errorMessage: err.message,
      });
      return false;
    }
  };

  return { get, set, increment, delete: del, setIfNotExists };
};

module.exports = { createRedisStore };
