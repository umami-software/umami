import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { Website } from '@/generated/prisma/client';

const redisMock = vi.hoisted(() => ({
  enabled: true,
  client: {
    fetch: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock('@/lib/redis', () => ({ default: redisMock }));
vi.mock('@/queries/prisma', () => ({ getWebsite: vi.fn() }));
vi.mock('@/queries/sql', () => ({ getWebsiteSession: vi.fn() }));

import {
  addTeamBillingStatus,
  getBillingAccess,
  getTeamBillingScope,
  isWebsiteCollectionBlocked,
} from './load';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('billing access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CLOUD_MODE', '1');
    redisMock.enabled = true;
  });

  test('uses the team owner account as the source of truth for past-due access', async () => {
    redisMock.client.get.mockImplementation(async key => {
      if (key === 'team:team-1') {
        return { teamOwnerId: 'owner-1', billingStatus: 'active' };
      }

      if (key === 'account:owner-1') {
        return { billingStatus: 'past_due' };
      }

      return null;
    });

    const scope = await getTeamBillingScope('team-1');

    await expect(getBillingAccess(scope, 'member-1')).resolves.toEqual({
      isPastDue: true,
      isOwner: false,
    });
    expect(scope).toEqual({ accountId: 'owner-1', teamId: 'team-1' });
  });

  test('adds team billing status from the owner account', async () => {
    redisMock.client.get.mockImplementation(async key => {
      if (key === 'team:team-1') {
        return { teamOwnerId: 'owner-1', billingStatus: 'active' };
      }

      if (key === 'account:owner-1') {
        return { billingStatus: 'past_due' };
      }

      return null;
    });

    await expect(addTeamBillingStatus([{ id: 'team-1' }])).resolves.toEqual([
      { id: 'team-1', billingStatus: 'past_due' },
    ]);
  });

  test('does not apply billing restrictions outside cloud mode', async () => {
    vi.stubEnv('CLOUD_MODE', '');

    await expect(getBillingAccess({ accountId: 'owner-1' })).resolves.toEqual({
      isPastDue: false,
      isOwner: false,
    });
    await expect(
      isWebsiteCollectionBlocked({ teamId: null, userId: 'owner-1' } as Website),
    ).resolves.toBe(false);
    expect(redisMock.client.get).not.toHaveBeenCalled();
  });

  test('does not apply billing restrictions without Redis', async () => {
    redisMock.enabled = false;

    await expect(getBillingAccess({ accountId: 'owner-1' })).resolves.toEqual({
      isPastDue: false,
      isOwner: false,
    });
    await expect(
      isWebsiteCollectionBlocked({ teamId: null, userId: 'owner-1' } as Website),
    ).resolves.toBe(false);
    expect(redisMock.client.get).not.toHaveBeenCalled();
  });
});

describe('collection blocking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CLOUD_MODE', '1');
    redisMock.enabled = true;
  });

  test('does not block collection from past_due during the grace period', async () => {
    redisMock.client.get.mockImplementation(async key => {
      if (key === 'account:owner-1') {
        return { billingStatus: 'past_due' };
      }

      return null;
    });

    await expect(
      isWebsiteCollectionBlocked({ teamId: null, userId: 'owner-1' } as Website),
    ).resolves.toBe(false);
    expect(redisMock.client.get).toHaveBeenCalledWith('user:block:owner-1');
    expect(redisMock.client.get).not.toHaveBeenCalledWith('account:owner-1');
  });

  test('blocks collection only after the collection block is added', async () => {
    redisMock.client.get.mockResolvedValue('payment');

    await expect(
      isWebsiteCollectionBlocked({ teamId: null, userId: 'owner-1' } as Website),
    ).resolves.toBe(true);
  });
});
