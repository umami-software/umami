import { beforeEach, describe, expect, test, vi } from 'vitest';
import { checkMcpRateLimit, resetMcpRateLimits } from './rate-limit';

vi.mock('@/lib/redis', () => ({
  default: { enabled: false, client: {} },
}));

beforeEach(() => {
  resetMcpRateLimits();
});

describe('checkMcpRateLimit', () => {
  test('allows up to the limit per user/client and then blocks', async () => {
    for (let i = 0; i < 3; i++) {
      await expect(checkMcpRateLimit('u', 'c', 3)).resolves.toBe(true);
    }

    await expect(checkMcpRateLimit('u', 'c', 3)).resolves.toBe(false);
    await expect(checkMcpRateLimit('u', 'other-client', 3)).resolves.toBe(true);
    await expect(checkMcpRateLimit('other-user', 'c', 3)).resolves.toBe(true);
  });

  test('resets after the window', async () => {
    vi.useFakeTimers();

    try {
      await expect(checkMcpRateLimit('u', 'c', 1, 1)).resolves.toBe(true);
      await expect(checkMcpRateLimit('u', 'c', 1, 1)).resolves.toBe(false);

      vi.advanceTimersByTime(1100);

      await expect(checkMcpRateLimit('u', 'c', 1, 1)).resolves.toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
