import { beforeEach, expect, test, vi } from 'vitest';
import { getRevenueChart } from './getRevenueChart';
import { getRevenueMetrics } from './getRevenueMetrics';
import { getRevenueStats } from './getRevenueStats';

const { rawQueryMock, parseFiltersMock, getDateSQLMock } = vi.hoisted(() => ({
  rawQueryMock: vi.fn(),
  parseFiltersMock: vi.fn(),
  getDateSQLMock: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  CLICKHOUSE: 'clickhouse',
  PRISMA: 'prisma',
  runQuery: vi.fn((queries: Record<string, () => unknown>) => queries.prisma()),
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
    rawQuery: vi.fn(),
    parseFilters: vi.fn(),
    getDateSQL: vi.fn(),
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
