const hits = new Map<string, { count: number; reset: number }>();

/** Tiny in-memory fixed-window limiter (per pod). Returns true when the call is allowed. */
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const entry = hits.get(key);

  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.reset < now) hits.delete(k);
    }
  }

  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }

  entry.count += 1;
  return entry.count <= max;
}
