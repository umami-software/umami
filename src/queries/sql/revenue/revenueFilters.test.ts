import { beforeEach, expect, test, vi } from 'vitest';
import { getRevenueChart } from './getRevenueChart';
import { getRevenueMetrics } from './getRevenueMetrics';
import { getRevenueStats } from './getRevenueStats';

const { rawQueryMock, parseFiltersMock, getDateSQLMock, db } = vi.hoisted(() => ({
  rawQueryMock: vi.fn(),
  parseFiltersMock: vi.fn(),
  getDateSQLMock: vi.fn(),
  db: { mode: 'prisma' },
}));

vi.mock('@/lib/db', () => ({
  CLICKHOUSE: 'clickhouse',
  PRISMA: 'prisma',
  runQuery: vi.fn((queries: Record<string, () => unknown>) => queries[db.mode]()),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    rawQuery: rawQueryMock,
    parseFilters: parseFiltersMock,
    getDateSQL: getDateSQLMock,
  },
}));

vi.mock('@/lib/clickhouse', () => ({
  default: {
    rawQuery: rawQueryMock,
    parseFilters: parseFiltersMock,
    getDateSQL: getDateSQLMock,
  },
}));

const parameters = {
  startDate: new Date('2026-05-18T00:00:00.000Z'),
  endDate: new Date('2026-05-19T00:00:00.000Z'),
  currency: 'EUR',
  unit: 'day',
  timezone: 'utc',
};

beforeEach(() => {
  db.mode = 'prisma';
  rawQueryMock.mockReset();
  parseFiltersMock.mockReset();
  getDateSQLMock.mockReset();

  parseFiltersMock.mockReturnValue({
    queryParams: {},
    filterQuery: 'and website_event.utm_source = {{utmSource}}',
    cohortQuery: '',
    joinSessionQuery: '',
    dateQuery: 'and created_at between {{startDate}} and {{endDate}}',
  });

  getDateSQLMock.mockReturnValue('bucketed_date');
});

test('getRevenueStats aggregates revenue from filtered sessions', async () => {
  rawQueryMock.mockResolvedValue([
    {
      sum: 0,
      count: 0,
      unique_count: 0,
      total_sessions: 0,
    },
  ]);

  await getRevenueStats('website-1', parameters, {});

  const [query] = rawQueryMock.mock.calls[0];

  expect(query).toContain('filtered_sessions as');
  expect(query).toContain('join filtered_sessions');
  expect(query).toContain('(select count(*) from filtered_sessions) as total_sessions');
  expect(query).not.toContain('and website_event.event_id = revenue.event_id');
});

test('getRevenueChart buckets filtered revenue instead of revenue rows joined by event id', async () => {
  rawQueryMock.mockResolvedValue([]);

  await getRevenueChart('website-1', parameters, {});

  const [query] = rawQueryMock.mock.calls[0];

  expect(query).toContain('filtered_sessions as');
  expect(query).toContain('filtered_revenue as');
  expect(query).toContain('from filtered_revenue');
  expect(query).toContain('bucketed_date');
  expect(query).not.toContain('and website_event.event_id = revenue.event_id');
});

test('getRevenueMetrics uses the filtered session set for screen-load breakdowns', async () => {
  rawQueryMock.mockResolvedValue([]);

  await getRevenueMetrics('website-1', parameters, {}, 'country');

  const [query] = rawQueryMock.mock.calls[0];

  expect(query).toContain('filtered_sessions as');
  expect(query).toContain('filtered_revenue as');
  expect(query).toContain('sum(filtered_revenue.revenue) as "value"');
  expect(query).not.toContain('and website_event.event_id = revenue.event_id');
});

test('getRevenueStats counts only positive revenue rows as orders', async () => {
  rawQueryMock.mockResolvedValue([{ sum: 900, count: 10, unique_count: 0, total_sessions: 0 }]);

  const result = await getRevenueStats('website-1', parameters, {});

  const [query] = rawQueryMock.mock.calls[0];

  expect(query).toContain('count(case when filtered_revenue.revenue > 0 then 1 end) as count');
  // Net revenue (payments minus refunds) per order.
  expect(result.average).toBe(90);
});

test('ClickHouse revenue stats always keep imported revenue and count only positive orders', async () => {
  db.mode = 'clickhouse';
  rawQueryMock.mockResolvedValue([{ sum: 900, count: 10, unique_count: 4, total_sessions: 30 }]);

  const result = await getRevenueStats('website-1', parameters, {});

  const [query] = rawQueryMock.mock.calls[0];

  expect(query).toContain("event_name in ('stripe:payment', 'stripe:refund'");
  expect(query).toContain('or session_id in (select session_id from filtered_sessions)');
  expect(query).not.toContain('inner join filtered_sessions');
  expect(query).toContain('countIf(filtered_revenue.revenue > 0) as count');
  expect(query).toContain('(select countIf(tracked_events > 0) from filtered_sessions)');
  expect(result.average).toBe(90);
  expect(result.arpu).toBe(30);
});

test('ClickHouse revenue chart always keeps imported revenue', async () => {
  db.mode = 'clickhouse';
  rawQueryMock.mockResolvedValue([]);

  await getRevenueChart('website-1', parameters, {});

  const [query] = rawQueryMock.mock.calls[0];

  expect(query).toContain("event_name in ('stripe:payment'");
  expect(query).toContain('or session_id in (select session_id from filtered_sessions)');
  expect(query).toContain('countIf(filtered_revenue.revenue > 0) count');
});

test('ClickHouse revenue channels put revenue without a tracked visit under unknown, not direct', async () => {
  db.mode = 'clickhouse';
  rawQueryMock.mockResolvedValue([]);

  await getRevenueMetrics('website-1', parameters, {}, 'channel');

  const [query] = rawQueryMock.mock.calls[0];

  expect(query).toContain("and not event_name in ('stripe:payment'");
  expect(query).toContain('any left join first_event');
  expect(query).toContain("when tracked = 0 then 'unknown'");
  expect(query).not.toContain("'Unknown'");
});

test('ClickHouse revenue locations keep revenue whose session has no event row', async () => {
  db.mode = 'clickhouse';
  rawQueryMock.mockResolvedValue([]);

  await getRevenueMetrics('website-1', parameters, {}, 'country');

  const [query] = rawQueryMock.mock.calls[0];

  expect(query).toContain("event_name in ('stripe:payment'");
  expect(query).toContain('any left join revenue_session');
});
