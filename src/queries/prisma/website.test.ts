import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  deleteWebsite,
  getAllUserWebsitesIncludingTeamAccess,
  getTeamWebsites,
  getUserWebsites,
  resetWebsite,
  transferWebsite,
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
  websiteFindManyMock,
  shareFindManyMock,
  getWebsiteVisitorTotalsMock,
} = vi.hoisted(() => ({
  transactionMock: vi.fn(),
  websiteUpdateMock: vi.fn(),
  redisDelMock: vi.fn(),
  redisSetMock: vi.fn(),
  redisState: { enabled: false },
  getSearchParametersMock: vi.fn(),
  pagedQueryMock: vi.fn(),
  websiteFindManyMock: vi.fn(),
  shareFindManyMock: vi.fn(),
  getWebsiteVisitorTotalsMock: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      website: {
        update: websiteUpdateMock,
        findMany: websiteFindManyMock,
      },
      share: {
        findMany: shareFindManyMock,
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

vi.mock('@/queries/sql/getWebsiteVisitorTotals', () => ({
  getWebsiteVisitorTotals: getWebsiteVisitorTotalsMock,
}));

describe('sorting websites by visitors', () => {
  // The ranking query returns websites by name; a page has no order of its own, so the mock
  // returns it reversed
  const websites = ['Alpha', 'Bravo', 'Charlie', 'Delta'].map(name => ({
    id: name.toLowerCase(),
    name,
  }));

  beforeEach(() => {
    getSearchParametersMock.mockReset();
    getSearchParametersMock.mockReturnValue({});
    pagedQueryMock.mockReset();
    shareFindManyMock.mockReset();
    shareFindManyMock.mockResolvedValue([]);
    websiteFindManyMock.mockReset();
    websiteFindManyMock.mockImplementation(async ({ where, select }) =>
      select
        ? websites.map(({ id }) => ({ id }))
        : websites.filter(({ id }) => where.id.in.includes(id)).reverse(),
    );
    getWebsiteVisitorTotalsMock.mockReset();
    getWebsiteVisitorTotalsMock.mockResolvedValue({ bravo: 5, charlie: 40, delta: 5 });
  });

  const getNames = (result: { data: { name: string }[] }) => result.data.map(({ name }) => name);

  test('orders by visitors with ties and websites without traffic in name order', async () => {
    const descending = await getUserWebsites('user-1', {
      orderBy: 'visitors',
      sortDescending: true,
    });
    const ascending = await getUserWebsites('user-1', { orderBy: 'visitors' });

    expect(getNames(descending)).toEqual(['Charlie', 'Bravo', 'Delta', 'Alpha']);
    expect(getNames(ascending)).toEqual(['Alpha', 'Bravo', 'Delta', 'Charlie']);
    expect(pagedQueryMock).not.toHaveBeenCalled();
  });

  test('pages through the ranked websites and counts all of them', async () => {
    const result = await getTeamWebsites('team-1', {
      orderBy: 'visitors',
      sortDescending: true,
      page: 2,
      pageSize: 3,
    });

    expect(getNames(result)).toEqual(['Alpha']);
    expect(result).toMatchObject({ count: 4, page: 2, pageSize: 3, orderBy: 'visitors' });
    expect(websiteFindManyMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { id: { in: ['alpha'] } },
        include: { createUser: { select: { id: true, username: true } } },
      }),
    );
  });

  test('ranks only the websites that match the list criteria', async () => {
    getSearchParametersMock.mockReturnValue({ OR: [{ name: { contains: 'al' } }] });

    await getUserWebsites('user-1', { orderBy: 'visitors', search: 'al' });

    expect(websiteFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-1',
          deletedAt: null,
          OR: [{ name: { contains: 'al' } }],
        }),
        select: { id: true },
      }),
    );
  });

  test('counts visitors over the sparkline window of the requested timezone', async () => {
    vi.useFakeTimers({ now: new Date('2026-11-07T20:00:00.000Z'), toFake: ['Date'] });

    await getUserWebsites('user-1', { orderBy: 'visitors', timezone: 'Asia/Tokyo' });

    vi.useRealTimers();

    expect(getWebsiteVisitorTotalsMock).toHaveBeenCalledWith(
      ['alpha', 'bravo', 'charlie', 'delta'],
      {
        startDate: new Date('2026-10-31T15:00:00.000Z'),
        endDate: new Date('2026-11-08T14:59:59.999Z'),
      },
    );
  });

  test('keeps other sorts on the paged website query', async () => {
    pagedQueryMock.mockResolvedValue({ data: [] });

    await getUserWebsites('user-1', { orderBy: 'createdAt' });

    expect(pagedQueryMock).toHaveBeenCalledWith(
      'website',
      expect.anything(),
      expect.objectContaining({ orderBy: 'createdAt' }),
    );
    expect(getWebsiteVisitorTotalsMock).not.toHaveBeenCalled();
  });
});

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

describe('transferWebsite', () => {
  const tx = {
    website: { findUnique: vi.fn(), update: vi.fn() },
    board: { updateMany: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    redisState.enabled = false;
    transactionMock.mockImplementation(fn => fn(tx));
    tx.website.update.mockResolvedValue({ id: 'website-1' });
  });

  // A single-website board only shows its own website; left behind it is broken for everyone
  // but the new owner, so it follows the website. Shares are keyed by board id and move with it.
  test('moves the team single-website boards to the user receiving the website', async () => {
    tx.website.findUnique.mockResolvedValue({ userId: null, teamId: 'team-1' });

    await transferWebsite('website-1', { userId: 'user-1', teamId: null });

    expect(tx.website.update).toHaveBeenCalledWith({
      where: { id: 'website-1' },
      data: { userId: 'user-1', teamId: null },
    });
    expect(tx.board.updateMany).toHaveBeenCalledWith({
      where: {
        type: 'website',
        parameters: { path: ['websiteId'], equals: 'website-1' },
        teamId: 'team-1',
      },
      data: { userId: 'user-1', teamId: null },
    });
  });

  test("moves the user's single-website boards to the team receiving the website", async () => {
    tx.website.findUnique.mockResolvedValue({ userId: 'user-1', teamId: null });

    await transferWebsite('website-1', { userId: null, teamId: 'team-1' });

    expect(tx.board.updateMany).toHaveBeenCalledWith({
      where: {
        type: 'website',
        parameters: { path: ['websiteId'], equals: 'website-1' },
        userId: 'user-1',
        teamId: null,
      },
      data: { userId: null, teamId: 'team-1' },
    });
  });

  test('moves boards between teams when the website moves to another team', async () => {
    tx.website.findUnique.mockResolvedValue({ userId: null, teamId: 'team-1' });

    await transferWebsite('website-1', { userId: null, teamId: 'team-2' });

    expect(tx.board.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ teamId: 'team-1' }),
        data: { userId: null, teamId: 'team-2' },
      }),
    );
  });

  test('only moves single-website boards owned by the previous owner', async () => {
    // Mixed boards and other owners' boards that reference the website are left alone.
    tx.website.findUnique.mockResolvedValue({ userId: null, teamId: 'team-1' });

    await transferWebsite('website-1', { userId: 'user-1', teamId: null });

    const { where } = tx.board.updateMany.mock.calls[0][0];
    expect(where.type).toBe('website');
    expect(where.teamId).toBe('team-1');
  });

  test('drops the cached website after the transfer', async () => {
    redisState.enabled = true;
    tx.website.findUnique.mockResolvedValue({ userId: null, teamId: 'team-1' });

    await transferWebsite('website-1', { userId: 'user-1', teamId: null });

    expect(redisDelMock).toHaveBeenCalledWith('website:website-1');
  });
});
