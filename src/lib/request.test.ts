import { beforeEach, expect, test, vi } from 'vitest';
import { fetchWebsite } from '@/lib/load';
import { getWebsiteSegment } from '@/queries/prisma';
import { getQueryFilters, resolvePeriodDateRange } from './request';

vi.hoisted(() => {
  process.env.DATABASE_URL ??= 'postgresql://user:pass@localhost:5432/umami?schema=public';
  delete process.env.DATABASE_REPLICA_URL;
});

vi.mock('@/lib/load', () => ({
  fetchAccount: vi.fn(),
  fetchWebsite: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  getWebsiteSegment: vi.fn(),
}));

const fetchWebsiteMock = vi.mocked(fetchWebsite);
const getWebsiteSegmentMock = vi.mocked(getWebsiteSegment);

beforeEach(() => {
  fetchWebsiteMock.mockReset();
  getWebsiteSegmentMock.mockReset();
  fetchWebsiteMock.mockResolvedValue({ id: 'website-1' } as any);
});

test('leaves explicit date parameters unchanged when period is omitted', () => {
  const params = { startAt: 100, endAt: 200, timezone: 'UTC' };

  expect(resolvePeriodDateRange(params)).toBe(params);
});

test('resolves a timezone-aware period into UTC timestamps', () => {
  const params = resolvePeriodDateRange(
    { period: 'today', timezone: 'America/Los_Angeles' },
    new Date('2026-07-24T12:00:00.000Z'),
  );

  expect(params).toMatchObject({
    startAt: +new Date('2026-07-24T07:00:00.000Z'),
    endAt: +new Date('2026-07-25T06:59:59.999Z'),
    timezone: 'America/Los_Angeles',
  });
});

test('combines a saved segment\'s session property filters with active filters', async () => {
  getWebsiteSegmentMock.mockResolvedValue({
    parameters: {
      filters: [],
      sessionPropertyFilters: [
        { propertyName: 'plan', dataType: 1, operator: 'eq', value: 'pro' },
      ],
    },
  } as any);

  const filters = await getQueryFilters(
    {
      startAt: String(+new Date('2026-09-01T00:00:00.000Z')),
      endAt: String(+new Date('2026-09-02T00:00:00.000Z')),
      segment: 'segment-1',
      spf0: '1.eq.country.US',
    },
    'website-1',
  );

  expect(filters.sessionPropertyFilters).toEqual([
    { propertyName: 'country', dataType: 1, operator: 'eq', value: 'US' },
    { propertyName: 'plan', dataType: 1, operator: 'eq', value: 'pro' },
  ]);
  expect(filters.startDate).toEqual(new Date('2026-09-01T00:00:00.000Z'));
  expect(filters.endDate).toEqual(new Date('2026-09-02T00:00:00.000Z'));
});
