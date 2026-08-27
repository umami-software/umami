import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  EMAIL_DOMAINS,
  LLM_DOMAINS,
  PAID_AD_PARAMS,
  SEARCH_DOMAINS,
  SHOPPING_DOMAINS,
  SOCIAL_DOMAINS,
  VIDEO_DOMAINS,
} from '@/lib/constants';
import { getChannelExpandedMetrics } from './getChannelExpandedMetrics';

const {
  state,
  prismaRawQuery,
  prismaParseFilters,
  getTimestampDiffSQL,
  clickhouseRawQuery,
  clickhouseParseFilters,
} = vi.hoisted(() => ({
  state: { mode: 'prisma' as 'prisma' | 'clickhouse' },
  prismaRawQuery: vi.fn(),
  prismaParseFilters: vi.fn(),
  getTimestampDiffSQL: vi.fn(),
  clickhouseRawQuery: vi.fn(),
  clickhouseParseFilters: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  CLICKHOUSE: 'clickhouse',
  PRISMA: 'prisma',
  runQuery: vi.fn((queries: Record<string, () => unknown>) => queries[state.mode]()),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    rawQuery: prismaRawQuery,
    parseFilters: prismaParseFilters,
    getTimestampDiffSQL,
  },
}));

vi.mock('@/lib/clickhouse', () => ({
  default: {
    rawQuery: clickhouseRawQuery,
    parseFilters: clickhouseParseFilters,
  },
}));

const parseFiltersResult = {
  queryParams: { websiteId: 'website-1' },
  filterQuery: 'and website_event.utm_source = {{utmSource}}',
  joinSessionQuery: 'join session on session.session_id = website_event.session_id',
  cohortQuery: 'join cohort on cohort.session_id = website_event.session_id',
  excludeBounceQuery: 'and website_event.visit_id in (select visit_id from bounces)',
  dateQuery: 'and created_at between {{startDate}} and {{endDate}}',
};

beforeEach(() => {
  state.mode = 'prisma';
  prismaRawQuery.mockReset();
  prismaParseFilters.mockReset();
  getTimestampDiffSQL.mockReset();
  clickhouseRawQuery.mockReset();
  clickhouseParseFilters.mockReset();

  prismaParseFilters.mockReturnValue(parseFiltersResult);
  clickhouseParseFilters.mockReturnValue(parseFiltersResult);
  getTimestampDiffSQL.mockReturnValue('ts_diff(min_time, max_time)');
  prismaRawQuery.mockResolvedValue([]);
  clickhouseRawQuery.mockResolvedValue([]);
});

describe('getChannelExpandedMetrics postgres branch', () => {
  test('builds the expanded aggregation query with parseFilters fragments', async () => {
    await getChannelExpandedMetrics('website-1', {});

    expect(prismaRawQuery).toHaveBeenCalledTimes(1);
    const [query, params, tag] = prismaRawQuery.mock.calls[0];

    expect(query).toContain('WITH prefix AS');
    expect(query).toContain('visit_stats as');
    expect(query).toContain('sum(visit_stats.c) as "pageviews"');
    expect(query).toContain('count(distinct visit_stats.session_id) as "visitors"');
    expect(query).toContain('count(distinct visit_stats.visit_id) as "visits"');
    expect(query).toContain('sum(case when visit_stats.c = 1 and coalesce(visit_events.has_custom_event, 0) = 0 then 1 else 0 end) as "bounces"');
    expect(query).toContain('visit_events as');
    expect(query).toContain('left join visit_events');
    // getTimestampDiffSQL output is injected into the totaltime column
    expect(query).toContain('sum(ts_diff(min_time, max_time)) as "totaltime"');
    expect(getTimestampDiffSQL).toHaveBeenCalledWith(
      'visit_stats.min_time',
      'visit_stats.max_time',
    );
    expect(query).toContain(parseFiltersResult.filterQuery);
    expect(query).toContain(parseFiltersResult.cohortQuery);
    expect(query).toContain(parseFiltersResult.excludeBounceQuery);
    expect(query).toContain(parseFiltersResult.joinSessionQuery);
    expect(params).toBe(parseFiltersResult.queryParams);
    expect(tag).toBe('getChannelExpandedMetrics');
  });

  test('toPostgresPositionClause renders one ilike per array entry', async () => {
    await getChannelExpandedMetrics('website-1', {});
    const [query] = prismaRawQuery.mock.calls[0];

    // LIKE wildcards/backslashes are escaped so values match literally (e.g. the
    // underscores in PAID_AD_PARAMS like `ad_id=` become `ad\_id=`).
    const escapeLike = (val: string) =>
      val.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_').replace(/'/g, "''");

    for (const val of PAID_AD_PARAMS) {
      expect(query).toContain(`url_query ilike '%${escapeLike(val)}%'`);
    }
    for (const domainList of [
      LLM_DOMAINS,
      SEARCH_DOMAINS,
      SOCIAL_DOMAINS,
      EMAIL_DOMAINS,
      SHOPPING_DOMAINS,
      VIDEO_DOMAINS,
    ]) {
      for (const val of domainList) {
        expect(query).toContain(`referrer_domain ilike '%${escapeLike(val)}%'`);
      }
    }
  });

  test('returns the query rows unchanged without a spurious y column', async () => {
    const rows = [
      { name: 'direct', pageviews: 10, visitors: 4, visits: 5, bounces: 1, totaltime: 100 },
    ];
    prismaRawQuery.mockResolvedValue(rows);

    const result = await getChannelExpandedMetrics('website-1', {});

    expect(result).toEqual(rows);
    expect(result[0]).not.toHaveProperty('y');
  });
});

describe('getChannelExpandedMetrics clickhouse branch', () => {
  beforeEach(() => {
    state.mode = 'clickhouse';
  });

  test('builds the multiSearchAny aggregation query', async () => {
    await getChannelExpandedMetrics('website-1', {});

    expect(clickhouseRawQuery).toHaveBeenCalledTimes(1);
    expect(prismaRawQuery).not.toHaveBeenCalled();
    const [query, params, tag] = clickhouseRawQuery.mock.calls[0];

    expect(query).toContain('uniq(t.session_id) as "visitors"');
    expect(query).toContain('uniq(t.visit_id) as "visits"');
    expect(query).toContain('sumIf(1, t.c = 1 and ifNull(e.has_custom_event, 0) = 0) as "bounces"');
    expect(query).toContain('left join (');
    expect(query).toContain('sum(max_time-min_time) as "totaltime"');
    expect(query).toContain('where website_id = {websiteId:UUID}');
    expect(query).toContain(
      'and created_at between {startDate:DateTime64} and {endDate:DateTime64}',
    );
    expect(query).toContain(parseFiltersResult.filterQuery);
    expect(query).toContain(parseFiltersResult.cohortQuery);
    expect(query).toContain(parseFiltersResult.excludeBounceQuery);
    expect(params).toBe(parseFiltersResult.queryParams);
    expect(tag).toBe('getChannelExpandedMetrics');
    // clickhouse expanded query does not use getTimestampDiffSQL or joinSessionQuery
    expect(getTimestampDiffSQL).not.toHaveBeenCalled();
    expect(query).not.toContain(parseFiltersResult.joinSessionQuery);
  });

  test('toClickHouseStringArray quotes and comma-joins each entry', async () => {
    await getChannelExpandedMetrics('website-1', {});
    const [query] = clickhouseRawQuery.mock.calls[0];

    expect(query).toContain(
      `multiSearchAny(lower(url_query), [${PAID_AD_PARAMS.map(v => `'${v}'`).join(', ')}])`,
    );
    expect(query).toContain(
      `multiSearchAny(lower(referrer_domain), [${SOCIAL_DOMAINS.map(v => `'${v}'`).join(', ')}])`,
    );
  });
});
