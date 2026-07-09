/**
 * @file errors.js
 * @description Typed provider errors. Every adapter throws ONE of these instead
 * of a raw SDK/HTTP error, so the orchestrator can make fallback decisions
 * without ever doing string-matching on error.message.
 *
 * Two independent flags drive orchestrator behavior:
 *   - retryable:        should the SAME provider be retried?
 *   - fallbackEligible: should the NEXT provider in priority be tried?
 * They are independent on purpose — e.g. an auth error is never retryable
 * (same bad key will fail again) but IS fallback-eligible (a different
 * provider has a different key and is unaffected).
 *
 * @module lib/ai/errors
 * @author Nozibul Islam
 * @version 1.0.0
 */

class ProviderError extends Error {
  constructor(
    message,
    {
      provider,
      cause = null,
      retryable = false,
      fallbackEligible = true,
      statusCode = null,
    } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.provider = provider;
    this.cause = cause;
    this.retryable = retryable;
    this.fallbackEligible = fallbackEligible;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, this.constructor);
  }
}

/** 429 — never retry the same provider immediately; try the next one. */
class ProviderRateLimitError extends ProviderError {
  constructor(provider, cause = null, retryAfterMs = null) {
    super(`${provider}: rate limit exceeded`, {
      provider,
      cause,
      retryable: false,
      fallbackEligible: true,
      statusCode: 429,
    });
    this.retryAfterMs = retryAfterMs;
  }
}

/** Request hung past the configured budget. Already paid the latency cost — don't retry, just fall back. */
class ProviderTimeoutError extends ProviderError {
  constructor(provider, cause = null, timeoutMs = null) {
    super(
      `${provider}: request timed out${timeoutMs ? ` after ${timeoutMs}ms` : ''}`,
      {
        provider,
        cause,
        retryable: false,
        fallbackEligible: true,
      }
    );
    this.timeoutMs = timeoutMs;
  }
}

/** 5xx or unclassified transport failure (network reset, DNS, etc). Provider-side issue, not ours. */
class ProviderServerError extends ProviderError {
  constructor(provider, cause = null, statusCode = null) {
    super(`${provider}: server error${statusCode ? ` (${statusCode})` : ''}`, {
      provider,
      cause,
      retryable: false,
      fallbackEligible: true,
      statusCode,
    });
  }
}

/**
 * 401/403 — invalid or expired key for THIS provider specifically.
 * fallbackEligible: true, because a different provider uses a different key
 * and is completely unaffected by this one being broken.
 * Marked severity 'critical' — this should be alerted/logged loudly, since
 * it means a provider is silently dead until a human rotates the key.
 */
class ProviderAuthError extends ProviderError {
  constructor(provider, cause = null) {
    super(`${provider}: authentication failed — check API key`, {
      provider,
      cause,
      retryable: false,
      fallbackEligible: true,
      statusCode: cause?.status ?? cause?.statusCode ?? 401,
    });
    this.severity = 'critical';
  }
}

/**
 * 400/422 — malformed request. Unlike auth errors, this is usually OUR bug
 * (bad prompt construction, invalid payload shape) and will likely fail
 * IDENTICALLY on every provider, since we send a structurally similar
 * request to all of them. fallbackEligible: false — don't waste 3 calls
 * repeating the same mistake; surface it immediately instead.
 */
class ProviderBadRequestError extends ProviderError {
  constructor(provider, cause = null, statusCode = 400) {
    super(`${provider}: bad request — likely a bug in request construction`, {
      provider,
      cause,
      retryable: false,
      fallbackEligible: false,
      statusCode,
    });
  }
}

/** Thrown by the orchestrator (not an adapter) once every provider in the priority list has failed. */
class AllProvidersFailedError extends ProviderError {
  constructor(attemptedProviders = [], errors = []) {
    super(`All AI providers failed: ${attemptedProviders.join(', ')}`, {
      provider: null,
      retryable: false,
      fallbackEligible: false,
    });
    this.attemptedProviders = attemptedProviders;
    this.errors = errors; // array of the individual ProviderError instances, for logging
  }
}

/**
 * Maps a known HTTP status code to the right typed error.
 * Adapters call this AFTER extracting a status code from their SDK's
 * particular error shape — the SDK-specific extraction stays in the adapter,
 * this function only handles "given a status code, what type of error is this".
 */
const classifyByStatusCode = (provider, statusCode, cause = null) => {
  if (statusCode === 429) return new ProviderRateLimitError(provider, cause);
  if (statusCode === 401 || statusCode === 403)
    return new ProviderAuthError(provider, cause);
  if (statusCode === 400 || statusCode === 422) {
    return new ProviderBadRequestError(provider, cause, statusCode);
  }
  if (statusCode >= 500 && statusCode < 600) {
    return new ProviderServerError(provider, cause, statusCode);
  }
  // Unrecognized status code (e.g. 418, or a status we haven't special-cased):
  // treat conservatively as a server-side issue rather than silently swallowing it.
  return new ProviderServerError(provider, cause, statusCode);
};

/**
 * Best-effort classification for an arbitrary caught error, when the adapter
 * hasn't already produced a typed error itself. Handles the common shapes:
 * abort/timeout errors, errors carrying an HTTP status in various common
 * locations, and raw network failures with no status at all.
 */
const classifyThrown = (provider, err) => {
  if (err instanceof ProviderError) return err; // already typed, pass through

  const isAbort =
    err?.name === 'AbortError' ||
    /aborted|timed?\s*out/i.test(err?.message || '');
  if (isAbort) return new ProviderTimeoutError(provider, err);

  const statusCode =
    err?.status ?? err?.statusCode ?? err?.response?.status ?? null;
  if (statusCode) return classifyByStatusCode(provider, statusCode, err);

  // No status, not an abort — likely a raw network failure (ECONNRESET, DNS, etc).
  // Fallback-eligible: we can't assume it's our bug, and another provider may
  // simply have a healthier network path right now.
  return new ProviderServerError(provider, err, null);
};

const isProviderError = (err) => err instanceof ProviderError;

module.exports = {
  ProviderError,
  ProviderRateLimitError,
  ProviderTimeoutError,
  ProviderServerError,
  ProviderAuthError,
  ProviderBadRequestError,
  AllProvidersFailedError,
  classifyByStatusCode,
  classifyThrown,
  isProviderError,
};
