/**
 * @file circuitBreaker.js
 * @description Circuit breaker state machine, sitting on top of the
 * CircuitStore contract (circuitStore.js / redisStore.js). Tracks
 * per-provider health ACROSS requests -- this is the piece
 * runExtractionAcrossProviders/runWritingAcrossProviders (orchestrator.js)
 * don't have on their own: those loops only know about the CURRENT
 * request. Without this, every single incoming request would independently
 * re-discover "Gemini is rate-limited" by actually calling it and getting a
 * 429 -- exactly the repeated-hammering problem identified in this
 * project's very first design conversation (hitting a rate-limited
 * provider repeatedly can make its cooldown worse, and adds latency to
 * every request in the meantime).
 *
 * States (per provider, independent, all inferred from CircuitStore data
 * rather than being an explicit enum column):
 *   CLOSED     -- no stored state (or explicitly cleared) -- requests go
 *                 through normally, failures are counted.
 *   OPEN       -- a state record exists with status 'open' and the cooldown
 *                 window (openedAt + OPEN_COOLDOWN_SECONDS) hasn't elapsed
 *                 yet -- provider is skipped entirely, no API call made.
 *   HALF_OPEN  -- the state record still says 'open', but the cooldown HAS
 *                 elapsed. Exactly one caller gets to claim the trial slot
 *                 (via CircuitStore.setIfNotExists, an atomic
 *                 claim) and actually call the provider; every other
 *                 concurrent caller during that same window is told
 *                 "not available" and moves on to the next provider.
 *
 * A failed HALF_OPEN trial re-opens the circuit with a fresh cooldown
 * (openedAt reset to now) -- this happens automatically as a side effect of
 * recordFailure()'s normal threshold check, since the failure counter was
 * already at/above threshold going in.
 *
 * @module lib/ai/shared/circuitBreaker
 * @author Nozibul Islam
 * @version 1.0.0
 */

const logger = require('./logger');
const { getTimeoutMs } = require('../config');

const FAILURE_THRESHOLD = Number(process.env.CIRCUIT_FAILURE_THRESHOLD) || 3;
const OPEN_COOLDOWN_SECONDS =
  Number(process.env.CIRCUIT_OPEN_COOLDOWN_SECONDS) || 30;

const stateKey = (provider) => `circuit:${provider}:state`;
const failureKey = (provider) => `circuit:${provider}:failures`;
const trialKey = (provider) => `circuit:${provider}:half_open_trial`;

/**
 * The half-open trial lease MUST outlive the actual per-request timeout
 * budget -- otherwise the lease could expire while the trial request is
 * still in flight (e.g. both defaulting to ~15s), letting a second
 * concurrent request grab the "single trial" slot while the first trial is
 * still resolving, defeating the whole point of gating to one trial.
 * Computed dynamically (not a fixed constant) so it stays correct if
 * AI_PROVIDER_TIMEOUT_MS is ever changed.
 */
const halfOpenTrialLeaseSeconds = () => Math.ceil(getTimeoutMs() / 1000) + 5;

/**
 * @param {import('./circuitStore').CircuitStore} store
 */
const createCircuitBreaker = (store) => {
  /**
   * @param {string} providerName
   * @returns {Promise<boolean>} true if this request may call the provider
   */
  const isAvailable = async (providerName) => {
    const state = await store.get(stateKey(providerName));

    if (!state || state.status !== 'open') {
      // No stored state -- treat as CLOSED (default). A Redis outage
      // degrades here too, via store.get()'s own graceful degradation
      // ("assume healthy" is the safe default -- see redisStore.js header).
      return true;
    }

    const cooldownElapsed =
      Date.now() >= state.openedAt + OPEN_COOLDOWN_SECONDS * 1000;
    if (!cooldownElapsed) {
      return false; // still cooling down -- skip this provider entirely
    }

    // Cooldown elapsed -- this is the HALF_OPEN moment. Exactly one
    // concurrent caller should get to try the provider.
    const wonTrial = await store.setIfNotExists(
      trialKey(providerName),
      { claimedAt: Date.now() },
      { ttlSeconds: halfOpenTrialLeaseSeconds() }
    );

    if (wonTrial) {
      logger.info('Circuit half-open trial claimed', {
        provider: providerName,
      });
    }

    return wonTrial;
  };

  /**
   * Call after a provider attempt succeeds. Fully resets the circuit --
   * whether this was a normal CLOSED-state success or a winning HALF_OPEN
   * trial, the outcome is the same: the provider is healthy again.
   * @param {string} providerName
   */
  const recordSuccess = async (providerName) => {
    await store.delete(stateKey(providerName));
    await store.delete(failureKey(providerName));
    await store.delete(trialKey(providerName));
  };

  /**
   * Call after a provider attempt fails with a failure that should count
   * against this provider's health. NOT every failure should call this --
   * see orchestrator.js's integration for which error types are excluded
   * (e.g. a BadRequestError reflects OUR bug, not this provider's health).
   * @param {string} providerName
   */
  const recordFailure = async (providerName) => {
    // Clear any in-flight half-open trial lease -- this attempt WAS that
    // trial (or a normal closed-state failure); either way it has now
    // resolved as a failure, so the lease shouldn't linger until its TTL.
    await store.delete(trialKey(providerName));

    const failures = await store.increment(failureKey(providerName), 1, {
      // TTL makes this a "failures in the last N seconds" sliding window,
      // not an all-time total -- the right semantic for a circuit-breaker
      // threshold (recent, consecutive failures).
      ttlSeconds: OPEN_COOLDOWN_SECONDS * 2,
    });

    if (failures >= FAILURE_THRESHOLD) {
      // Unconditionally sets a FRESH openedAt -- this correctly restarts
      // the cooldown clock even when this call is re-opening the circuit
      // after a failed half-open trial (failures was already >= threshold
      // going in; this branch runs again, resetting the timer).
      await store.set(
        stateKey(providerName),
        { status: 'open', openedAt: Date.now() },
        { ttlSeconds: OPEN_COOLDOWN_SECONDS * 4 } // safety-net expiry, well past the cooldown itself
      );
      logger.error('Circuit opened for provider', {
        provider: providerName,
        failures,
        cooldownSeconds: OPEN_COOLDOWN_SECONDS,
      });
    }
  };

  return { isAvailable, recordSuccess, recordFailure };
};

module.exports = {
  createCircuitBreaker,
  FAILURE_THRESHOLD,
  OPEN_COOLDOWN_SECONDS,
};
