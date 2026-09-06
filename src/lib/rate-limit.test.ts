import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  redis: { enabled: false, client: { rateLimit: vi.fn() } },
}));

vi.mock('@/lib/redis', () => ({
  default: mocks.redis,
}));

import { checkRateLimit, RATE_LIMIT_MAX_KEYS, resetRateLimits } from './rate-limit';

beforeEach(() => {
  resetRateLimits();
  mocks.redis.enabled = false;
  mocks.redis.client.rateLimit.mockReset();
});

describe('checkRateLimit (in-memory)', () => {
  test('gives every key its own budget', async () => {
    for (let i = 0; i < 3; i++) {
      await expect(checkRateLimit('a', 3, 60)).resolves.toBe(true);
    }

    await expect(checkRateLimit('a', 3, 60)).resolves.toBe(false);
    await expect(checkRateLimit('b', 3, 60)).resolves.toBe(true);
  });

  test('resets after the window', async () => {
    vi.useFakeTimers();

    try {
      await expect(checkRateLimit('a', 1, 1)).resolves.toBe(true);
      await expect(checkRateLimit('a', 1, 1)).resolves.toBe(false);

      vi.advanceTimersByTime(1100);

      await expect(checkRateLimit('a', 1, 1)).resolves.toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  test('keeps tracking new keys once the key cap is reached', async () => {
    for (let i = 0; i < RATE_LIMIT_MAX_KEYS + 50; i++) {
      await expect(checkRateLimit(`key-${i}`, 1, 60)).resolves.toBe(true);
    }

    // The newest key is still tracked and limited independently.
    await expect(checkRateLimit(`key-${RATE_LIMIT_MAX_KEYS + 49}`, 1, 60)).resolves.toBe(false);
    await expect(checkRateLimit('fresh', 1, 60)).resolves.toBe(true);
  });
});

describe('checkRateLimit (redis)', () => {
  test('allows exactly `limit` hits per window', async () => {
    mocks.redis.enabled = true;

    let count = 0;
    mocks.redis.client.rateLimit.mockImplementation(async (_key: string, threshold: number) => {
      count += 1;

      return count >= threshold;
    });

    for (let i = 0; i < 3; i++) {
      await expect(checkRateLimit('a', 3, 60)).resolves.toBe(true);
    }

    await expect(checkRateLimit('a', 3, 60)).resolves.toBe(false);
    expect(mocks.redis.client.rateLimit).toHaveBeenCalledWith('a', 4, 60);
  });
});
