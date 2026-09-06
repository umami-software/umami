import redis from '@/lib/redis';

/** Upper bound on tracked keys when Redis is unavailable, so limiter memory stays bounded. */
export const RATE_LIMIT_MAX_KEYS = 10_000;

const memory = new Map<string, { count: number; resetAt: number }>();

function evictMemoryEntries(now: number) {
  for (const [key, entry] of memory) {
    if (entry.resetAt <= now) {
      memory.delete(key);
    }
  }

  // Still full after dropping expired windows: shed the oldest windows. This fails open for the
  // evicted keys (their budget restarts) rather than denying anyone, which keeps a flood of
  // distinct keys from turning the limiter itself into a denial-of-service vector.
  while (memory.size >= RATE_LIMIT_MAX_KEYS) {
    const oldest = memory.keys().next().value;

    if (oldest === undefined) {
      break;
    }

    memory.delete(oldest);
  }
}

/**
 * Fixed-window rate limiter keyed by a caller-supplied identity (IP address, user/client, ...).
 * Resolves `true` while the key is within `limit` hits for the current window.
 *
 * Uses Redis when configured so the window is shared across instances. Otherwise falls back to a
 * bounded process-local map in which every key still gets its own independent budget, so one
 * source can never exhaust the limit for another.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  if (redis.enabled) {
    // `rateLimit` resolves true once the counter reaches its threshold, so pass `limit + 1` to
    // allow exactly `limit` hits per window.
    return !(await redis.client.rateLimit(key, limit + 1, windowSeconds));
  }

  const now = Date.now();
  const entry = memory.get(key);

  if (entry && entry.resetAt > now) {
    entry.count += 1;

    return entry.count <= limit;
  }

  // Delete before re-inserting so the key moves to the newest position for eviction ordering.
  memory.delete(key);

  if (memory.size >= RATE_LIMIT_MAX_KEYS) {
    evictMemoryEntries(now);
  }

  memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });

  return limit >= 1;
}

export function resetRateLimits() {
  memory.clear();
}
