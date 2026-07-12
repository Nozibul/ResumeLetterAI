/**
 * @file circuitStore.js
 * @description CircuitStore contract + an in-memory reference implementation.
 *
 * This is the storage abstraction the future Circuit Breaker (step 14) sits
 * on top of. Two things live here:
 *   1. The CircuitStore contract itself (documented via JSDoc @typedef,
 *      since plain JS has no interfaces) -- get/set/increment/delete.
 *   2. MemoryStore -- an implementation of that contract, for UNIT TESTS
 *      ONLY. The running app (dev AND prod) uses RedisStore (step 13) as
 *      the concrete implementation -- Redis is already part of this
 *      project's infra, and the deployment target (VPS vs serverless)
 *      isn't settled yet. An in-memory circuit breaker would silently stop
 *      working correctly the moment the app runs as multiple serverless
 *      instances, each with its own memory and no shared state -- exactly
 *      the failure mode identified earlier in this project's design phase.
 *
 * Illustrative future usage (step 14 will actually write this):
 *   const state = await store.get(`circuit:${providerName}:state`);
 *   const failures = await store.increment(`circuit:${providerName}:failures`);
 *   if (failures >= THRESHOLD) {
 *     await store.set(`circuit:${providerName}:state`, { status: 'open', openedAt: Date.now() }, { ttlSeconds: 60 });
 *   }
 *
 * @module lib/ai/shared/circuitStore
 * @author Nozibul Islam
 * @version 1.0.0
 */

/**
 * @typedef {object} CircuitStore
 * @property {(key: string) => Promise<any|null>} get
 *   Returns the stored value for `key`, or null if absent/expired.
 * @property {(key: string, value: any, options?: {ttlSeconds?: number}) => Promise<void>} set
 *   Stores `value` under `key`. If ttlSeconds is given, the key self-expires
 *   after that many seconds -- a safety net so a circuit can never get stuck
 *   OPEN forever even if the app never explicitly closes it.
 * @property {(key: string, amount?: number, options?: {ttlSeconds?: number}) => Promise<number>} increment
 *   Atomically increments a numeric counter at `key` by `amount` (default 1)
 *   and returns the new value. Must be atomic under concurrent callers --
 *   this is what lets several simultaneously-failing requests correctly
 *   accumulate one shared failure count instead of racing on a
 *   read-modify-write and undercounting.
 * @property {(key: string) => Promise<void>} delete
 *   Removes `key` entirely.
 * @property {(key: string, value: any, options?: {ttlSeconds?: number}) => Promise<boolean>} setIfNotExists
 *   Atomically sets `key` to `value` ONLY if it doesn't already exist,
 *   returning true if this call "won" (the set happened) or false if
 *   another caller already holds the key. Maps directly to Redis's native
 *   SET key value NX. This is what lets exactly one concurrent request
 *   claim a circuit breaker's single HALF_OPEN trial slot, instead of a
 *   thundering herd of requests all re-testing a recovering provider at once.
 */

/**
 * In-memory implementation of CircuitStore. UNIT-TEST USE ONLY -- see file
 * header for why this is never the production store.
 *
 * Each call creates an independent store (its own Map) -- tests get natural
 * isolation from each other without needing an explicit reset/teardown step.
 *
 * @returns {CircuitStore}
 */
const createMemoryStore = () => {
  const values = new Map(); // key -> { value, expiresAt: number|null }

  const isExpired = (entry) =>
    entry.expiresAt !== null && entry.expiresAt <= Date.now();

  const get = async (key) => {
    const entry = values.get(key);
    if (!entry) return null;
    if (isExpired(entry)) {
      values.delete(key);
      return null;
    }
    return entry.value;
  };

  const set = async (key, value, { ttlSeconds } = {}) => {
    values.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  };

  const increment = async (key, amount = 1, { ttlSeconds } = {}) => {
    // Deliberately synchronous body (no `await` between read and write) --
    // safe against interleaving even though the function is declared async,
    // since Node's single event loop can't preempt code that never yields.
    // This is what makes this in-memory version genuinely atomic, not just
    // "atomic in the common case."
    const entry = values.get(key);
    const current = entry && !isExpired(entry) ? entry.value : 0;
    const next = (typeof current === 'number' ? current : 0) + amount;
    values.set(key, {
      value: next,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
    return next;
  };

  const del = async (key) => {
    values.delete(key);
  };

  const setIfNotExists = async (key, value, { ttlSeconds } = {}) => {
    // Same "no await between read and write" reasoning as increment() --
    // genuinely atomic for the in-memory case.
    const existing = values.get(key);
    if (existing && !isExpired(existing)) return false;
    values.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
    return true;
  };

  return { get, set, increment, delete: del, setIfNotExists };
};

module.exports = { createMemoryStore };
