import { checkRateLimit, resetRateLimits } from '@/lib/rate-limit';

export const MCP_RATE_LIMIT_WINDOW_SECONDS = 60;

export function getMcpRateLimit() {
  const configured = Number(process.env.MCP_RATE_LIMIT);

  return Number.isFinite(configured) && configured > 0 ? configured : 120;
}

/**
 * Per-user, per-client limit for MCP requests. Keyed by identity rather than IP because remote
 * MCP platforms share egress addresses. Resolves `true` while the request is within the limit.
 */
export function checkMcpRateLimit(
  userId: string,
  clientId: string,
  limit = getMcpRateLimit(),
  windowSeconds = MCP_RATE_LIMIT_WINDOW_SECONDS,
): Promise<boolean> {
  return checkRateLimit(`mcp:rate:${userId}:${clientId}`, limit, windowSeconds);
}

export function resetMcpRateLimits() {
  resetRateLimits();
}
