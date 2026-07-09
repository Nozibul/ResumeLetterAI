/**
 * @file config.js
 * @description Central AI provider configuration — priority resolution, API key
 * presence checks, and timeout defaults. Fails fast at load time if no provider
 * is usable, instead of surfacing a confusing error mid-request.
 * @module lib/ai/config
 * @author Nozibul Islam
 * @version 1.0.0
 */

const KNOWN_PROVIDERS = Object.freeze(['gemini', 'openrouter', 'groq']);

const REQUIRED_ENV_KEY = Object.freeze({
  gemini: 'GEMINI_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  groq: 'GROQ_API_KEY',
});

const DEFAULT_PRIORITY = Object.freeze(['gemini', 'openrouter', 'groq']);
const DEFAULT_TIMEOUT_MS = 15000;

/**
 * "gemini, OpenRouter ,groq" -> ['gemini', 'openrouter', 'groq']
 * Returns null (not []) when the env var is absent/blank, so the caller can
 * distinguish "not set — use default" from "set but empty — misconfiguration".
 */
const parsePriorityEnv = (raw) => {
  if (!raw || !raw.trim()) return null;
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
};

const dedupe = (arr) => [...new Set(arr)];

/**
 * Resolves the final, usable provider priority order.
 *
 * Rules (in order):
 * 1. AI_PROVIDER_PRIORITY env var wins if set; otherwise DEFAULT_PRIORITY.
 * 2. Unknown provider names (typos, old names) are dropped with a warning —
 *    fail-soft on naming so a typo in .env doesn't crash the whole app.
 * 3. Duplicate names are silently deduped (first occurrence wins its position).
 * 4. A provider without its required API key is dropped with a warning —
 *    no point routing to something that can't authenticate.
 * 5. If NOTHING is left usable, throw immediately. This must run at app
 *    startup, not on the first user request — better to crash on boot with
 *    a clear message than to 500 a real user later.
 *
 * @param {NodeJS.ProcessEnv} env - injectable for testing; defaults to process.env
 * @returns {string[]} ordered list of usable provider names, length >= 1
 */
const resolveProviderPriority = (env = process.env) => {
  const rawList =
    parsePriorityEnv(env.AI_PROVIDER_PRIORITY) || DEFAULT_PRIORITY;
  const deduped = dedupe(rawList);

  const known = deduped.filter((name) => {
    if (KNOWN_PROVIDERS.includes(name)) return true;
    console.warn(
      `[ai-config] Unknown provider "${name}" in AI_PROVIDER_PRIORITY — ignoring. ` +
        `Valid options: ${KNOWN_PROVIDERS.join(', ')}`
    );
    return false;
  });

  const usable = known.filter((name) => {
    const keyName = REQUIRED_ENV_KEY[name];
    const hasKey = Boolean(env[keyName] && env[keyName].trim());
    if (!hasKey) {
      console.warn(
        `[ai-config] "${name}" skipped — missing env var ${keyName}.`
      );
    }
    return hasKey;
  });

  if (usable.length === 0) {
    throw new Error(
      '[ai-config] No usable AI provider is configured. ' +
        `Set at least one of: ${Object.values(REQUIRED_ENV_KEY).join(', ')}`
    );
  }

  return usable;
};

/**
 * Per-call timeout budget in ms. Falls back to DEFAULT_TIMEOUT_MS if the env
 * var is absent, non-numeric, zero, or negative — never lets a bad env value
 * silently produce an infinite or zero timeout.
 */
const getTimeoutMs = (env = process.env) => {
  const raw = Number(env.AI_PROVIDER_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TIMEOUT_MS;
};

// Memoized default resolution — env doesn't change at runtime in production,
// so we resolve once instead of re-parsing on every single request.
// Tests that need different env values should call resolveProviderPriority(customEnv)
// directly instead of this cached wrapper.
let cachedPriority = null;

const getProviderPriority = () => {
  if (!cachedPriority) {
    cachedPriority = resolveProviderPriority(process.env);
  }
  return cachedPriority;
};

module.exports = {
  KNOWN_PROVIDERS,
  REQUIRED_ENV_KEY,
  DEFAULT_PRIORITY,
  DEFAULT_TIMEOUT_MS,
  resolveProviderPriority,
  getTimeoutMs,
  getProviderPriority,
};
