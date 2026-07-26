/**
 * In-Memory Rate Limiter
 * ========================
 * Simple sliding-window rate limiter using a Map.
 * Suitable for single-instance deployments. For multi-instance
 * or serverless, swap this out for a Redis-backed solution.
 *
 * Usage:
 *   const limiter = rateLimit({ interval: 60000, maxRequests: 10 });
 *   const result = limiter.check('user_123');
 *   if (!result.success) {
 *     return Response.json({ error: 'Rate limited' }, { status: 429 });
 *   }
 */

/**
 * Create a rate limiter instance.
 *
 * @param {object} options
 * @param {number} [options.interval=60000]    – Time window in ms (default 60s)
 * @param {number} [options.maxRequests=10]    – Max requests per window
 * @param {number} [options.cleanupInterval=300000] – How often to purge stale entries (default 5min)
 * @returns {{ check: (identifier: string) => { success: boolean, remaining?: number, retryAfter?: number } }}
 */
export function rateLimit({
  interval = 60_000,
  maxRequests = 10,
  cleanupInterval = 300_000,
} = {}) {
  // Map<identifier, { timestamps: number[] }>
  const store = new Map();

  // Periodic cleanup of expired entries to prevent memory leaks
  let cleanupTimer = null;

  function startCleanup() {
    if (cleanupTimer) return;
    cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of store.entries()) {
        // Remove timestamps outside the window
        entry.timestamps = entry.timestamps.filter((t) => now - t < interval);
        // Remove the entry entirely if no timestamps remain
        if (entry.timestamps.length === 0) {
          store.delete(key);
        }
      }
    }, cleanupInterval);

    // Allow the Node process to exit even if this timer is active
    if (cleanupTimer?.unref) {
      cleanupTimer.unref();
    }
  }

  startCleanup();

  /**
   * Check if an identifier is within the rate limit.
   *
   * @param {string} identifier – Unique key (user ID, IP, API key, etc.)
   * @returns {{ success: boolean, remaining: number, retryAfter?: number }}
   */
  function check(identifier) {
    const now = Date.now();

    if (!store.has(identifier)) {
      store.set(identifier, { timestamps: [] });
    }

    const entry = store.get(identifier);

    // Prune timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((t) => now - t < interval);

    if (entry.timestamps.length >= maxRequests) {
      // Rate limited — calculate when the earliest request expires
      const oldestTimestamp = entry.timestamps[0];
      const retryAfter = Math.ceil((oldestTimestamp + interval - now) / 1000);

      return {
        success: false,
        remaining: 0,
        retryAfter: Math.max(1, retryAfter), // seconds
      };
    }

    // Under the limit — record this request
    entry.timestamps.push(now);

    return {
      success: true,
      remaining: maxRequests - entry.timestamps.length,
    };
  }

  /**
   * Reset the rate limit for a specific identifier.
   * Useful for admin overrides or testing.
   */
  function reset(identifier) {
    store.delete(identifier);
  }

  /** Get the current size of the store (for monitoring). */
  function size() {
    return store.size;
  }

  return { check, reset, size };
}

// ── Pre-configured limiter instances ────────────────────────────────

/** General API rate limiter – 30 requests per minute */
export const apiLimiter = rateLimit({
  interval: 60_000,
  maxRequests: 30,
});

/** AI endpoint limiter – 10 requests per minute (Gemini quota protection) */
export const aiLimiter = rateLimit({
  interval: 60_000,
  maxRequests: 10,
});

/** Upload limiter – 5 uploads per 10 minutes */
export const uploadLimiter = rateLimit({
  interval: 600_000,
  maxRequests: 5,
});
