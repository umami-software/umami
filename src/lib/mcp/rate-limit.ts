import redis from '@/lib/redis';

export const MCP_RATE_LIMIT_WINDOW_SECONDS = 60;

const memory = new Map<string, { count: number; resetAt: number }>();

export function getMcpRateLimit() {
  const configured = Number(process.env.MCP_RATE_LIMIT);

  return Number.isFinite(configured) && configured > 0 ? configured : 120;
}

/**
 * Per-user, per-client limit for MCP requests. Keyed by identity rather than IP because remote
 * MCP platforms share egress addresses. Uses Redis when available, otherwise a process-local
 * fixed window (sufficient for single-instance self-hosted deployments).
 */
export async function checkMcpRateLimit(
  userId: string,
  clientId: string,
  limit = getMcpRateLimit(),
  windowSeconds = MCP_RATE_LIMIT_WINDOW_SECONDS,
): Promise<boolean> {
  const key = `mcp:rate:${userId}:${clientId}`;

  if (redis.enabled) {
    return redis.client.rateLimit(key, limit, windowSeconds);
  }

  const now = Date.now();
  const entry = memory.get(key);

  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });

    if (memory.size > 10_000) {
      for (const [k, v] of memory) {
        if (v.resetAt <= now) {
          memory.delete(k);
        }
      }
    }

    return true;
  }

  entry.count += 1;

  return entry.count <= limit;
}

export function resetMcpRateLimits() {
  memory.clear();
}
