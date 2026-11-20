import { afterEach, describe, expect, test, vi } from 'vitest';

const parseFiltersResult = {
  queryParams: { websiteId: 'website-1' },
  filterQuery: 'and website_event.url_path = {{path}}',
  joinSessionQuery: 'join session on session.session_id = website_event.session_id',
  cohortQuery: 'join cohort on cohort.session_id = website_event.session_id',
  excludeBounceQuery: 'join excludeBounce on excludeBounce.visit_id = website_event.visit_id',
};

async function loadModule({
  mode,
}: {
  mode: 'prisma' | 'clickhouse';
}) {
  vi.resetModules();

  const state = { mode };
  const prismaRawQuery = vi.fn().mockResolvedValue([{}]);
  const prismaParseFilters = vi.fn().mockReturnValue(parseFiltersResult);
  const getTimestampDiffSQL = vi.fn().mockReturnValue('ts_diff(t.min_time, t.max_time)');
  const clickhouseRawQuery = vi.fn().mockResolvedValue([{}]);
  const clickhouseParseFilters = vi.fn().mockReturnValue(parseFiltersResult);

  vi.doMock('@/lib/db', () => ({
    CLICKHOUSE: 'clickhouse',
    PRISMA: 'prisma',
    runQuery: vi.fn((queries: Record<string, () => unknown>) => queries[state.mode]()),
  }));

  vi.doMock('@/lib/prisma', () => ({
    default: {
      rawQuery: prismaRawQuery,
      parseFilters: prismaParseFilters,
      getTimestampDiffSQL,
    },
  }));

  vi.doMock('@/lib/clickhouse', () => ({
    default: {
      rawQuery: clickhouseRawQuery,
      parseFilters: clickhouseParseFilters,
    },
  }));

  const mod = await import('./getWebsiteStats');

  return {
    getWebsiteStats: mod.getWebsiteStats,
    prismaRawQuery,
    clickhouseRawQuery,
  };
}

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('getWebsiteStats default bounce path', () => {
  test('postgres uses a single grouped pass for the default path', async () => {
    const { getWebsiteStats, prismaRawQuery } = await loadModule({ mode: 'prisma' });

    await getWebsiteStats('website-1', {});

    const [query] = prismaRawQuery.mock.calls[0];

    expect(query).toContain('t.c = 1 and t.has_custom_event = 0');
    expect(query).toContain('max(case when website_event.event_type = 2 then 1 else 0 end) as "has_custom_event"');
    expect(query).not.toContain('left join (');
  });

  test('clickhouse uses the hourly aggregate view without the extra join', async () => {
    const { getWebsiteStats, clickhouseRawQuery } = await loadModule({ mode: 'clickhouse' });

    await getWebsiteStats('website-1', {});

    const [query] = clickhouseRawQuery.mock.calls[0];

    expect(query).toContain('from website_event_stats_hourly "website_event"');
    expect(query).toContain('sumIf(1, t.c = 1 and t.has_custom_event = 0) as "bounces"');
    expect(query).toContain('has_custom_event');
    expect(query).not.toContain('left join (');
  });
});

describe('getWebsiteStats filtered bounce path', () => {
  // The custom-event flag is computed in the same filtered scan as pageviews, so with an
  // event filter (e.g. a URL) only custom events matching that filter can prevent a bounce.
  test('postgres reads custom events in the same filtered scan instead of a second join', async () => {
    const { getWebsiteStats, prismaRawQuery } = await loadModule({ mode: 'prisma' });

    await getWebsiteStats('website-1', { path: '/pricing' } as any);

    const [query] = prismaRawQuery.mock.calls[0];

    expect(query).not.toContain('left join (');
    expect(query.match(/from website_event\b/g)).toHaveLength(1);
    expect(query).toContain('t.c = 1 and t.has_custom_event = 0');
    expect(query.indexOf(parseFiltersResult.filterQuery)).toBeLessThan(
      query.indexOf(
        'having sum(case when website_event.event_type NOT IN (2, 5) then 1 else 0 end) > 0',
      ),
    );
  });

  test('clickhouse reads custom events in the same filtered scan instead of a second join', async () => {
    const { getWebsiteStats, clickhouseRawQuery } = await loadModule({ mode: 'clickhouse' });

    await getWebsiteStats('website-1', { path: '/pricing' } as any);

    const [query] = clickhouseRawQuery.mock.calls[0];

    expect(query).not.toContain('website_event_stats_hourly');
    expect(query).not.toContain('left join (');
    expect(query.match(/from website_event\b/g)).toHaveLength(1);
    expect(query).toContain('sumIf(1, t.c = 1 and t.has_custom_event = 0) as "bounces"');
    expect(query).toContain('max(if(event_type = 2, 1, 0)) has_custom_event');
  });
});

// Issue #3518: visit duration spans every event in the visit except performance, so a
// one-page visit with a custom event later on has a duration > 0 and is not a bounce.
// Visits with only custom events (no pageviews) are still not counted as visits.
describe('getWebsiteStats visit duration and visit eligibility', () => {
  test('postgres takes duration from all non-performance events', async () => {
    for (const filters of [{}, { path: '/pricing' }]) {
      const { getWebsiteStats, prismaRawQuery } = await loadModule({ mode: 'prisma' });

      await getWebsiteStats('website-1', filters as any);

      const [query] = prismaRawQuery.mock.calls[0];

      expect(query).toContain('and website_event.event_type != 5');
      expect(query).toContain('min(website_event.created_at) as "min_time"');
      expect(query).toContain('max(website_event.created_at) as "max_time"');
      expect(query).not.toContain('then website_event.created_at end');
    }
  });

  test('postgres excludes visits without pageviews and counts only pageviews as views', async () => {
    const { getWebsiteStats, prismaRawQuery } = await loadModule({ mode: 'prisma' });

    await getWebsiteStats('website-1', { path: '/pricing' } as any);

    const [query] = prismaRawQuery.mock.calls[0];

    expect(query).toContain(
      'sum(case when website_event.event_type NOT IN (2, 5) then 1 else 0 end) as "c"',
    );
    expect(query).toContain(
      'having sum(case when website_event.event_type NOT IN (2, 5) then 1 else 0 end) > 0',
    );
  });

  test('clickhouse takes duration from all non-performance events on both paths', async () => {
    const hourly = await loadModule({ mode: 'clickhouse' });
    await hourly.getWebsiteStats('website-1', {});
    const [hourlyQuery] = hourly.clickhouseRawQuery.mock.calls[0];

    expect(hourlyQuery).toContain('min(min_time) min_time');
    expect(hourlyQuery).toContain('max(max_time) max_time');
    expect(hourlyQuery).not.toContain('minIf(');
    expect(hourlyQuery).not.toContain('maxIf(');

    const raw = await loadModule({ mode: 'clickhouse' });
    await raw.getWebsiteStats('website-1', { path: '/pricing' } as any);
    const [rawQuery] = raw.clickhouseRawQuery.mock.calls[0];

    expect(rawQuery).toContain('and event_type != 5');
    expect(rawQuery).toContain('min(created_at) min_time');
    expect(rawQuery).toContain('max(created_at) max_time');
  });

  test('clickhouse excludes visits without pageviews on both paths', async () => {
    const hourly = await loadModule({ mode: 'clickhouse' });
    await hourly.getWebsiteStats('website-1', {});
    const [hourlyQuery] = hourly.clickhouseRawQuery.mock.calls[0];

    // website_event_stats_hourly.views only counts event types outside (2, 5).
    expect(hourlyQuery).toContain('sum(views) c');
    expect(hourlyQuery).toContain('having c > 0');

    const raw = await loadModule({ mode: 'clickhouse' });
    await raw.getWebsiteStats('website-1', { path: '/pricing' } as any);
    const [rawQuery] = raw.clickhouseRawQuery.mock.calls[0];

    expect(rawQuery).toContain('sumIf(1, event_type NOT IN (2, 5)) c');
    expect(rawQuery).toContain('having c > 0');
  });
});

describe('getWebsiteStats excludeBounce path', () => {
  test('clickhouse skips the extra join when excludeBounce is enabled', async () => {
    const { getWebsiteStats, clickhouseRawQuery } = await loadModule({ mode: 'clickhouse' });

    await getWebsiteStats('website-1', { excludeBounce: true });

    const [query] = clickhouseRawQuery.mock.calls[0];

    expect(query).toContain('0 as "bounces"');
    expect(query).not.toContain('left join (');
  });

  test('postgres skips the extra join when excludeBounce is enabled on the filtered path', async () => {
    const { getWebsiteStats, prismaRawQuery } = await loadModule({ mode: 'prisma' });

    await getWebsiteStats('website-1', { excludeBounce: true, path: '/pricing' } as any);

    const [query] = prismaRawQuery.mock.calls[0];

    expect(query).toContain('0 as "bounces"');
    expect(query).not.toContain('left join (');
  });
});
