import { beforeEach, expect, test, vi } from 'vitest';
import { checkAuth } from '@/lib/auth';
import { fetchWebsite } from '@/lib/load';
import { getWebsiteSegment } from '@/queries/prisma';
import { getQueryFilters, parseRequest, resolvePeriodDateRange } from './request';

vi.hoisted(() => {
  process.env.DATABASE_URL ??= 'postgresql://user:pass@localhost:5432/umami?schema=public';
  delete process.env.DATABASE_REPLICA_URL;
});

vi.mock('@/lib/auth', () => ({
  checkAuth: vi.fn(),
}));

vi.mock('@/lib/load', () => ({
  fetchAccount: vi.fn(),
  fetchWebsite: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  getWebsiteSegment: vi.fn(),
}));

const checkAuthMock = vi.mocked(checkAuth);
const fetchWebsiteMock = vi.mocked(fetchWebsite);
const getWebsiteSegmentMock = vi.mocked(getWebsiteSegment);

beforeEach(() => {
  checkAuthMock.mockReset();
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

test("combines a saved segment's session property filters with active filters", async () => {
  getWebsiteSegmentMock.mockResolvedValue({
    parameters: {
      filters: [],
      sessionPropertyFilters: [{ propertyName: 'plan', dataType: 1, operator: 'eq', value: 'pro' }],
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

// Segment filter names are stored as free-form strings. A stored filter named after a query
// option (e.g. timezone, which is interpolated into SQL) must not replace the validated value.
test('ignores saved segment filters that are not filter columns', async () => {
  getWebsiteSegmentMock.mockResolvedValue({
    parameters: {
      filters: [
        { name: 'timezone', operator: 'eq', value: "UTC'; select 1; --" },
        { name: 'unit', operator: 'eq', value: 'x' },
        { name: 'browser', operator: 'eq', value: 'chrome' },
      ],
    },
  } as any);

  const filters = await getQueryFilters(
    {
      startAt: String(+new Date('2026-09-01T00:00:00.000Z')),
      endAt: String(+new Date('2026-09-02T00:00:00.000Z')),
      timezone: 'America/New_York',
      unit: 'day',
      segment: 'segment-1',
    },
    'website-1',
  );

  expect(filters.timezone).toBe('America/New_York');
  expect(filters.unit).toBe('day');
  expect(filters.browser).toBe('eq.chrome');
});

// The API accepts segments and cohorts without `filters` (e.g. created through the API or by
// older versions), so applying one must not throw.
test('applies a saved segment that has no filters array', async () => {
  getWebsiteSegmentMock.mockResolvedValue({
    parameters: {
      sessionPropertyFilters: [{ propertyName: 'plan', dataType: 1, operator: 'eq', value: 'pro' }],
    },
  } as any);

  const filters = await getQueryFilters(
    {
      startAt: String(+new Date('2026-09-01T00:00:00.000Z')),
      endAt: String(+new Date('2026-09-02T00:00:00.000Z')),
      segment: 'segment-1',
    },
    'website-1',
  );

  expect(filters.sessionPropertyFilters).toEqual([
    { propertyName: 'plan', dataType: 1, operator: 'eq', value: 'pro' },
  ]);
});

test('applies a saved cohort that has no filters array', async () => {
  getWebsiteSegmentMock.mockResolvedValue({
    parameters: { dateRange: '30day', action: { type: 'path', value: '/signup' } },
  } as any);

  const filters = await getQueryFilters(
    {
      startAt: String(+new Date('2026-09-01T00:00:00.000Z')),
      endAt: String(+new Date('2026-09-02T00:00:00.000Z')),
      cohort: 'cohort-1',
    },
    'website-1',
  );

  expect(filters).toMatchObject({ cohort_path: 'eq./signup' });
  expect(filters).toHaveProperty('cohort_startDate');
});

// The API accepts segments and cohorts without `filters` (e.g. created through the API or by
// older versions), so applying one must not throw.
test('applies a saved segment that has no filters array', async () => {
  getWebsiteSegmentMock.mockResolvedValue({
    parameters: {
      sessionPropertyFilters: [{ propertyName: 'plan', dataType: 1, operator: 'eq', value: 'pro' }],
    },
  } as any);

  const filters = await getQueryFilters(
    {
      startAt: String(+new Date('2026-09-01T00:00:00.000Z')),
      endAt: String(+new Date('2026-09-02T00:00:00.000Z')),
      segment: 'segment-1',
    },
    'website-1',
  );

  expect(filters.sessionPropertyFilters).toEqual([
    { propertyName: 'plan', dataType: 1, operator: 'eq', value: 'pro' },
  ]);
});

test('applies a saved cohort that has no filters array', async () => {
  getWebsiteSegmentMock.mockResolvedValue({
    parameters: { dateRange: '30day', action: { type: 'path', value: '/signup' } },
  } as any);

  const filters = await getQueryFilters(
    {
      startAt: String(+new Date('2026-09-01T00:00:00.000Z')),
      endAt: String(+new Date('2026-09-02T00:00:00.000Z')),
      cohort: 'cohort-1',
    },
    'website-1',
  );

  expect(filters).toMatchObject({ cohort_path: 'eq./signup' });
  expect(filters).toHaveProperty('cohort_startDate');
});

test('parseRequest blocks a session pending required 2FA setup', async () => {
  // A password alone must not unlock the API for accounts that are required to use 2FA.
  checkAuthMock.mockResolvedValue({ user: { id: 'user-1' }, twoFactorSetupPending: true } as any);

  const { error } = await parseRequest(new Request('http://localhost/api/websites'));
  const response = error();

  expect(response.status).toBe(403);
  await expect(response.json()).resolves.toMatchObject({
    error: { code: 'two-factor-error-setup-required' },
  });
});

test('parseRequest lets a session pending required 2FA setup reach routes that opt in', async () => {
  checkAuthMock.mockResolvedValue({ user: { id: 'user-1' }, twoFactorSetupPending: true } as any);

  const { auth, error } = await parseRequest(
    new Request('http://localhost/api/2fa/setup/initiate'),
    null,
    { allowTwoFactorSetup: true },
  );

  expect(error).toBeUndefined();
  expect(auth.user.id).toBe('user-1');
});

test('parseRequest does not block an account that still uses the default password', async () => {
  // The password prompt is UI only. Existing API and MCP integrations owned by the seeded admin
  // must keep working after an upgrade.
  checkAuthMock.mockResolvedValue({ user: { id: 'admin-1' }, passwordChangeRequired: true } as any);

  const { auth, error } = await parseRequest(new Request('http://localhost/api/websites'));

  expect(error).toBeUndefined();
  expect(auth.user.id).toBe('admin-1');
});

test('parseRequest allows ordinary sessions on every route', async () => {
  checkAuthMock.mockResolvedValue({ user: { id: 'user-1' }, twoFactorSetupPending: false } as any);

  const { error } = await parseRequest(new Request('http://localhost/api/websites'));

  expect(error).toBeUndefined();
});
