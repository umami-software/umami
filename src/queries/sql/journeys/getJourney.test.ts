import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getJourney } from './getJourney';

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

const parameters = {
  startDate: new Date('2026-05-18T00:00:00.000Z'),
  endDate: new Date('2026-05-19T00:00:00.000Z'),
  steps: 3,
};

beforeEach(() => {
  prismaRawQuery.mockReset();
  clickhouseRawQuery.mockReset();

  prismaParseFilters.mockReturnValue({ queryParams: {}, filterQuery: '' });
  clickhouseParseFilters.mockReturnValue({ queryParams: {}, filterQuery: '' });
  prismaRawQuery.mockResolvedValue([]);
  clickhouseRawQuery.mockResolvedValue([]);
});

describe('getJourney', () => {
  test('postgres excludes performance events from the steps', async () => {
    state.mode = 'prisma';
    await getJourney('website-1', parameters, {});

    const [query] = prismaRawQuery.mock.calls[0];
    expect(query).toContain('and website_event.event_type != 5');
  });

  test('clickhouse excludes performance events from the steps', async () => {
    state.mode = 'clickhouse';
    await getJourney('website-1', parameters, {});

    const [query] = clickhouseRawQuery.mock.calls[0];
    expect(query).toContain('and event_type != 5');
  });
});
