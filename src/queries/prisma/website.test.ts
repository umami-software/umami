import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  deleteWebsite,
  getAllUserWebsitesIncludingTeamAccess,
  resetWebsite,
  updateWebsite,
} from './website';

const {
  transactionMock,
  websiteUpdateMock,
  redisDelMock,
  redisSetMock,
  redisState,
  getSearchParametersMock,
  pagedQueryMock,
} = vi.hoisted(() => ({
  transactionMock: vi.fn(),
  websiteUpdateMock: vi.fn(),
  redisDelMock: vi.fn(),
  redisSetMock: vi.fn(),
  redisState: { enabled: false },
  getSearchParametersMock: vi.fn(),
  pagedQueryMock: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      website: {
        update: websiteUpdateMock,
      },
    },
    transaction: transactionMock,
    getSearchParameters: getSearchParametersMock,
    pagedQuery: pagedQueryMock,
  },
  getSchema: () => new URL(process.env.DATABASE_URL || '').searchParams.get('schema'),
}));

vi.mock('@/lib/redis', () => ({
  default: {
    get enabled() {
      return redisState.enabled;
    },
    client: {
      del: redisDelMock,
      set: redisSetMock,
    },
  },
}));

describe('team website access', () => {
  beforeEach(() => {
    getSearchParametersMock.mockReset();
    getSearchParametersMock.mockReturnValue({});
    pagedQueryMock.mockReset();
    pagedQueryMock.mockResolvedValue({ data: [] });
  });

  test('includes websites for a team member because membership grants view access', async () => {
    await getAllUserWebsitesIncludingTeamAccess('team-user');

    expect(pagedQueryMock).toHaveBeenCalledWith(
      'website',
      expect.objectContaining({
        where: {
          OR: [
            { userId: 'team-user' },
            {
              team: {
                deletedAt: null,
                members: {
                  some: { userId: 'team-user' },
                },
              },
            },
          ],
          deletedAt: null,
        },
      }),
      expect.any(Object),
    );
  });
});

function createDeleteTx(calls: string[]) {
  return {
    sessionReplaySaved: {
      deleteMany: vi.fn(async () => {
        calls.push('sessionReplaySaved');
      }),
    },
    sessionReplay: {
      deleteMany: vi.fn(async () => {
        calls.push('sessionReplay');
      }),
    },
    heatmapEvent: {
      deleteMany: vi.fn(async () => {
        calls.push('heatmapEvent');
      }),
    },
    revenue: {
      deleteMany: vi.fn(async () => {
        calls.push('revenue');
      }),
    },
    errorEvent: {
      deleteMany: vi.fn(async () => {
        calls.push('errorEvent');
      }),
    },
    errorIssue: {
      deleteMany: vi.fn(async () => {
        calls.push('errorIssue');
      }),
    },
    errorRateLimit: {
      deleteMany: vi.fn(async () => {
        calls.push('errorRateLimit');
      }),
    },
    eventData: {
      deleteMany: vi.fn(async () => {
        calls.push('eventData');
      }),
    },
    $executeRawUnsafe: vi.fn(async () => {
      calls.push('rawSql');
    }),
    sessionData: {
      deleteMany: vi.fn(async () => {
        calls.push('sessionData');
      }),
    },
    sessionLink: {
      deleteMany: vi.fn(async () => {
        calls.push('sessionLink');
      }),
    },
    websiteEvent: {
      deleteMany: vi.fn(async () => {
        calls.push('websiteEvent');
      }),
    },
    session: {
      deleteMany: vi.fn(async () => {
        calls.push('session');
      }),
    },
    report: {
      deleteMany: vi.fn(async () => {
        calls.push('report');
      }),
    },
    segment: {
      deleteMany: vi.fn(async () => {
        calls.push('segment');
      }),
    },
    annotation: {
      deleteMany: vi.fn(async () => {
        calls.push('annotation');
      }),
    },
    share: {
      deleteMany: vi.fn(async () => {
        calls.push('share');
      }),
    },
    website: {
      delete: vi.fn(async () => {
        calls.push('websiteDelete');
        return { id: 'website-1' };
      }),
      update: vi.fn(async () => {
        calls.push('websiteUpdate');
        return { id: 'website-1' };
      }),
    },
  };
}

describe('website delete dependencies', () => {
  beforeEach(() => {
    transactionMock.mockReset();
    redisDelMock.mockReset();
    redisSetMock.mockReset();
    delete process.env.CLOUD_MODE;
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/umami?schema=public';
  });

  test('deleteWebsite runs fast event-data cleanup, a relational safety pass, and heatmap cleanup before deleting website events', async () => {
    const calls: string[] = [];
    const tx = createDeleteTx(calls);

    transactionMock.mockImplementation(async callback => callback(tx));

    await deleteWebsite('website-1');

    expect(tx.eventData.deleteMany).toHaveBeenCalledWith({
      where: { websiteId: 'website-1' },
    });
    expect(tx.heatmapEvent.deleteMany).toHaveBeenCalledWith({
      where: { websiteId: 'website-1' },
    });
    expect(tx.$executeRawUnsafe).toHaveBeenNthCalledWith(1, 'SET search_path TO "public";');
    expect(tx.$executeRawUnsafe).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('delete from event_data'),
      'website-1',
    );
    expect(tx.$executeRawUnsafe).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('website_event.website_id = $1'),
      'website-1',
    );
    expect(calls).toEqual([
      'sessionReplaySaved',
      'sessionReplay',
      'heatmapEvent',
      'revenue',
      'errorEvent',
      'errorIssue',
      'errorRateLimit',
      'eventData',
      'rawSql',
      'rawSql',
      'sessionData',
      'sessionLink',
      'websiteEvent',
      'session',
      'report',
      'segment',
      'annotation',
      'share',
      'websiteDelete',
    ]);
  });

  test('resetWebsite uses the same two-pass event-data cleanup before resetting the website', async () => {
    const calls: string[] = [];
    const tx = createDeleteTx(calls);

    transactionMock.mockImplementation(async callback => callback(tx));

    await resetWebsite('website-1');

    expect(tx.eventData.deleteMany).toHaveBeenCalledWith({
      where: { websiteId: 'website-1' },
    });
    expect(tx.heatmapEvent.deleteMany).toHaveBeenCalledWith({
      where: { websiteId: 'website-1' },
    });
    expect(tx.$executeRawUnsafe).toHaveBeenNthCalledWith(1, 'SET search_path TO "public";');
    expect(tx.$executeRawUnsafe).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('website_event.website_id = $1'),
      'website-1',
    );
    expect(calls).toEqual([
      'sessionReplaySaved',
      'sessionReplay',
      'heatmapEvent',
      'revenue',
      'errorEvent',
      'errorIssue',
      'errorRateLimit',
      'eventData',
      'rawSql',
      'rawSql',
      'sessionData',
      'sessionLink',
      'websiteEvent',
      'session',
      'websiteUpdate',
    ]);
  });
});

// /api/send reads the website from Redis for 24h, so self-hosted installs with Redis
// must invalidate it too, not only cloud.
describe('website cache invalidation', () => {
  beforeEach(() => {
    transactionMock.mockReset();
    transactionMock.mockImplementation(async callback => callback(createDeleteTx([])));
    websiteUpdateMock.mockReset();
    websiteUpdateMock.mockResolvedValue({ id: 'website-1' });
    redisDelMock.mockReset();
    redisSetMock.mockReset();
    redisState.enabled = true;
    delete process.env.CLOUD_MODE;
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/umami?schema=public';
  });

  test('deleteWebsite drops the cached website on a self-hosted install', async () => {
    await deleteWebsite('website-1');

    expect(redisDelMock).toHaveBeenCalledWith('website:website-1');
  });

  test('resetWebsite caches the reset website so resetAt applies right away', async () => {
    await resetWebsite('website-1');

    expect(redisSetMock).toHaveBeenCalledWith('website:website-1', { id: 'website-1' });
  });

  test('updateWebsite drops the cached website so owner and team changes apply', async () => {
    await updateWebsite('website-1', { teamId: 'team-2' });

    expect(redisDelMock).toHaveBeenCalledWith('website:website-1');
  });

  test('nothing is touched in Redis when it is not enabled', async () => {
    redisState.enabled = false;

    await deleteWebsite('website-1');
    await resetWebsite('website-1');
    await updateWebsite('website-1', { name: 'Site' });

    expect(redisDelMock).not.toHaveBeenCalled();
    expect(redisSetMock).not.toHaveBeenCalled();
  });
});
