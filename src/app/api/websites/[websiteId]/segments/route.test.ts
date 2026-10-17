import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { canUpdateWebsite } from '@/permissions';
import { createSegment } from '@/queries/prisma';
import { POST } from './route';

vi.mock('@/lib/request', () => ({
  getQueryFilters: vi.fn(),
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canUpdateWebsite: vi.fn(),
  canViewSharedWebsiteFilters: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  createSegment: vi.fn(),
  getWebsiteSegments: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const canUpdateWebsiteMock = vi.mocked(canUpdateWebsite);
const createSegmentMock = vi.mocked(createSegment);

function post(body: Record<string, any>) {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body,
    error: undefined,
  } as any);

  return POST(new Request('http://localhost/api/websites/website-1/segments', { method: 'POST' }), {
    params: Promise.resolve({ websiteId: 'website-1' }),
  });
}

beforeEach(() => {
  parseRequestMock.mockReset();
  canUpdateWebsiteMock.mockReset().mockResolvedValue(true);
  createSegmentMock.mockReset().mockResolvedValue({ id: 'segment-1' } as any);
});

// The API enforces what the dashboard forms require, so API clients can't save records that
// the dashboard could not have created.
test('requires a name', async () => {
  await post({ type: 'segment', name: 'Everyone', parameters: {} });
  const schema = parseRequestMock.mock.calls[0][1] as {
    safeParse: (value: unknown) => { success: boolean };
  };

  expect(schema.safeParse({ type: 'segment', name: '', parameters: {} }).success).toBe(false);
  expect(schema.safeParse({ type: 'segment', name: 'Everyone', parameters: {} }).success).toBe(
    true,
  );
});

// A cohort without these can't be computed and used to fail every request that applied it.
test.each([
  ['no action', { dateRange: '30day' }],
  ['no action value', { dateRange: '30day', action: { type: 'path', value: '' } }],
  ['no date range', { action: { type: 'path', value: '/signup' } }],
])('rejects a cohort with %s', async (_label, parameters) => {
  const response = await post({ type: 'cohort', name: 'Signups', parameters });

  expect(response.status).toBe(400);
  expect(createSegmentMock).not.toHaveBeenCalled();
});

test('creates a complete cohort, and a segment without filters', async () => {
  const cohort = await post({
    type: 'cohort',
    name: 'Signups',
    parameters: { dateRange: '30day', action: { type: 'path', value: '/signup' } },
  });
  const segment = await post({ type: 'segment', name: 'Everyone', parameters: {} });

  expect(cohort.status).toBe(200);
  expect(segment.status).toBe(200);
  expect(createSegmentMock).toHaveBeenCalledTimes(2);
});
