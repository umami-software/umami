import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  allowed: true,
  normalized: {
    startDate: new Date(1500),
    endDate: new Date(2000),
    unit: 'day',
    timezone: 'UTC',
    path: '/pricing',
  },
  query: vi.fn(async (..._args: any[]) => [{ count: 7 }]),
}));
vi.mock('@/permissions', () => ({
  canViewWebsiteSection: vi.fn(async () => mocks.allowed),
  canViewAuthenticatedWebsite: vi.fn(async () => mocks.allowed),
}));
vi.mock('@/lib/request', () => ({
  parseRequest: async (request: Request, schema: any) => {
    const result = schema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
    return result.success
      ? { auth: {}, query: result.data }
      : { error: () => new Response(null, { status: 400 }) };
  },
  getQueryFilters: vi.fn(async () => mocks.normalized),
}));
vi.mock('@/queries/sql/journeys/getJourney', () => ({ getJourney: mocks.query }));
vi.mock('@/queries/sql/retention/getRetention', () => ({ getRetention: mocks.query }));
vi.mock('@/queries/sql/breakdown/getBreakdown', () => ({ getBreakdown: mocks.query }));
vi.mock('@/queries/sql/attribution/getAttribution', () => ({ getAttribution: mocks.query }));
vi.mock('@/queries/sql/heatmap/getHeatmap', () => ({ getHeatmap: mocks.query }));

import { GET as journeys } from '@/app/api/websites/[websiteId]/journeys/route';
import { GET as retention } from '@/app/api/websites/[websiteId]/retention/route';
import { GET as breakdown } from '@/app/api/websites/[websiteId]/breakdown/route';
import { GET as attribution } from '@/app/api/websites/[websiteId]/attribution/route';
import { GET as heatmaps } from '@/app/api/websites/[websiteId]/heatmaps/route';

const cases = [
  ['journeys', journeys, { steps: '3' }],
  ['retention', retention, {}],
  ['breakdown', breakdown, { fields: '["path"]' }],
  ['attribution', attribution, { model: 'last-click', type: 'event', step: 'signup' }],
  ['heatmaps', heatmaps, { mode: 'click', urlPath: '/pricing' }],
] as const;

describe.each(cases)('%s GET analytics', (_name, handler, params) => {
  beforeEach(() => {
    mocks.allowed = true;
    mocks.query.mockClear();
  });
  const context = { params: Promise.resolve({ websiteId: 'website' }) };
  const request = () =>
    new Request(
      `https://example.org/api?${new URLSearchParams({ startAt: '1000', endAt: '2000', ...params })}`,
    );
  test('uses normalized dates and path-scoped website', async () => {
    const response = await handler(request(), context);
    expect(response.status).toBe(200);
    expect(mocks.query.mock.calls[0]?.[0]).toBe('website');
    expect(mocks.query.mock.calls[0]?.[1]).toMatchObject(mocks.normalized);
  });
  test('does not execute a query without permission', async () => {
    mocks.allowed = false;
    expect((await handler(request(), context)).status).toBe(401);
    expect(mocks.query).not.toHaveBeenCalled();
  });
  test('rejects missing dates before querying', async () => {
    expect((await handler(new Request('https://example.org/api'), context)).status).toBe(400);
    expect(mocks.query).not.toHaveBeenCalled();
  });
});
