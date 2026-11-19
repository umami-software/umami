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
import { getChannelMetrics } from './getChannelMetrics';

const { state, prismaRawQuery, prismaParseFilters, clickhouseRawQuery, clickhouseParseFilters } =
  vi.hoisted(() => ({
    state: { mode: 'prisma' as 'prisma' | 'clickhouse' },
    prismaRawQuery: vi.fn(),
    prismaParseFilters: vi.fn(),
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
  clickhouseRawQuery.mockReset();
  clickhouseParseFilters.mockReset();

  prismaParseFilters.mockReturnValue(parseFiltersResult);
  clickhouseParseFilters.mockReturnValue(parseFiltersResult);
  prismaRawQuery.mockResolvedValue([]);
  clickhouseRawQuery.mockResolvedValue([]);
});

describe('getChannelMetrics postgres branch', () => {
  test('builds the channel classification CTE with parseFilters fragments injected', async () => {
    await getChannelMetrics('website-1', {});

    expect(prismaRawQuery).toHaveBeenCalledTimes(1);
    const [query, params, tag] = prismaRawQuery.mock.calls[0];

    expect(query).toContain('WITH prefix AS');
    expect(query).toContain('channels as');
    expect(query).toContain('visit_channels as');
    expect(query).toContain('where website_event.website_id = {{websiteId::uuid}}');
    expect(query).toContain('and website_event.event_type NOT IN (2, 5)');
    // parseFilters fragments are interpolated verbatim
    expect(query).toContain(parseFiltersResult.filterQuery);
    expect(query).toContain(parseFiltersResult.cohortQuery);
    expect(query).toContain(parseFiltersResult.excludeBounceQuery);
    expect(query).toContain(parseFiltersResult.joinSessionQuery);
    expect(query).toContain(parseFiltersResult.dateQuery);
    expect(params).toBe(parseFiltersResult.queryParams);
    expect(tag).toBe('getChannelMetrics');
  });

  test('emits the direct/paidAds/referral CASE branches in order', async () => {
    await getChannelMetrics('website-1', {});
    const [query] = prismaRawQuery.mock.calls[0];

    expect(query).toContain("when referrer_domain = '' and url_query = '' then 'direct'");
    expect(query).toContain("then 'paidAds'");
    expect(query).toContain("utm_medium ilike '%affiliate%' then 'affiliate'");
    expect(query).toContain("utm_medium ilike '%sms%' or utm_source ilike '%sms%' then 'sms'");
    expect(query).toContain("concat(prefix, 'Search')");
    expect(query).toContain("concat(prefix, 'Social')");
    expect(query).toContain("concat(prefix, 'Shopping')");
    expect(query).toContain("concat(prefix, 'Video')");
  });

  test('toPostgresLikeClause renders one ilike per array entry joined by OR', async () => {
    await getChannelMetrics('website-1', {});
    const [query] = prismaRawQuery.mock.calls[0];

    // LIKE wildcards/backslashes are escaped so values match literally (e.g. the
    // underscores in PAID_AD_PARAMS like `ad_id=` become `ad\_id=`).
    const escapeLike = (val: string) =>
      val.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_').replace(/'/g, "''");

    for (const val of PAID_AD_PARAMS) {
      expect(query).toContain(`url_query ilike '%${escapeLike(val)}%'`);
    }
    for (const val of SEARCH_DOMAINS) {
      expect(query).toContain(`referrer_domain ilike '%${escapeLike(val)}%'`);
    }
    for (const domainList of [
      LLM_DOMAINS,
      SOCIAL_DOMAINS,
      EMAIL_DOMAINS,
      SHOPPING_DOMAINS,
      VIDEO_DOMAINS,
    ]) {
      for (const val of domainList) {
        expect(query).toContain(`referrer_domain ilike '%${escapeLike(val)}%'`);
      }
    }
    // referral clause uses a literal array, not a constant
    expect(query).toContain("utm_medium ilike '%referral%'");
    expect(query).toContain("utm_medium ilike '%app%'");
    expect(query).toContain("utm_medium ilike '%link%'");
  });

  test('coerces the y column to a number in results', async () => {
    prismaRawQuery.mockResolvedValue([{ x: 'direct', y: '42' }]);

    const result = await getChannelMetrics('website-1', {});

    expect(result).toEqual([{ x: 'direct', y: 42 }]);
  });

  // toPostgresLikeClause escapes LIKE wildcards (% and _) and backslashes so the
  // value matches literally, then escapes single quotes for the SQL string
  // literal. The hardcoded constants contain none of these, so their rendered
  // form is unchanged; this asserts each constant appears intact in the clause.
  test('renders an ilike clause for each escaped constant value', async () => {
    await getChannelMetrics('website-1', {});
    const [query] = prismaRawQuery.mock.calls[0];

    const escapeLike = (val: string) =>
      val.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_').replace(/'/g, "''");

    for (const val of [...PAID_AD_PARAMS, ...LLM_DOMAINS, ...SEARCH_DOMAINS]) {
      expect(query).toContain(`'%${escapeLike(val)}%'`);
    }
  });
});

describe('getChannelMetrics clickhouse branch', () => {
  beforeEach(() => {
    state.mode = 'clickhouse';
  });

  test('builds the multiSearchAny channel query with parseFilters fragments', async () => {
    await getChannelMetrics('website-1', {});

    expect(clickhouseRawQuery).toHaveBeenCalledTimes(1);
    expect(prismaRawQuery).not.toHaveBeenCalled();
    const [query, params, tag] = clickhouseRawQuery.mock.calls[0];

    expect(query).toContain('WITH channels as');
    expect(query).toContain('where website_id = {websiteId:UUID}');
    expect(query).toContain('and event_type NOT IN (2, 5)');
    expect(query).toContain(
      "multiSearchAny(lower(utm_medium), ['cp', 'ppc', 'retargeting', 'paid'])",
    );
    expect(query).toContain(parseFiltersResult.filterQuery);
    expect(query).toContain(parseFiltersResult.cohortQuery);
    expect(query).toContain(parseFiltersResult.excludeBounceQuery);
    expect(query).toContain(parseFiltersResult.dateQuery);
    expect(params).toBe(parseFiltersResult.queryParams);
    expect(tag).toBe('getChannelMetrics');
    // clickhouse branch does not join a session table
    expect(query).not.toContain(parseFiltersResult.joinSessionQuery);
  });

  test('toClickHouseStringArray quotes and comma-joins each entry', async () => {
    await getChannelMetrics('website-1', {});
    const [query] = clickhouseRawQuery.mock.calls[0];

    expect(query).toContain(
      `multiSearchAny(lower(url_query), [${PAID_AD_PARAMS.map(v => `'${v}'`).join(', ')}])`,
    );
    expect(query).toContain(
      `multiSearchAny(lower(referrer_domain), [${LLM_DOMAINS.map(v => `'${v}'`).join(', ')}])`,
    );
    expect(query).toContain(
      `multiSearchAny(lower(referrer_domain), [${SEARCH_DOMAINS.map(v => `'${v}'`).join(', ')}])`,
    );
  });

  // toClickHouseStringArray escapes backslashes and single quotes for ClickHouse
  // string literals. The constants contain neither, so they render unchanged.
  test('clickhouse array escaping handles backslashes and single quotes', async () => {
    await getChannelMetrics('website-1', {});
    const [query] = clickhouseRawQuery.mock.calls[0];

    for (const val of [...VIDEO_DOMAINS, ...SHOPPING_DOMAINS]) {
      const escaped = val.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      expect(query).toContain(`'${escaped}'`);
    }
  });
});
