import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { canUpdateWebsite, canViewSharedWebsite } from '@/permissions';
import { getWebsiteSegment, updateSegment } from '@/queries/prisma';
import { GET, POST } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canDeleteWebsite: vi.fn(),
  canUpdateWebsite: vi.fn(),
  canViewSharedWebsite: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  deleteSegment: vi.fn(),
  getWebsiteSegment: vi.fn(),
  updateSegment: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const canUpdateWebsiteMock = vi.mocked(canUpdateWebsite);
const canViewSharedWebsiteMock = vi.mocked(canViewSharedWebsite);
const getWebsiteSegmentMock = vi.mocked(getWebsiteSegment);
const updateSegmentMock = vi.mocked(updateSegment);

function post(body: Record<string, any>) {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body,
    error: undefined,
  } as any);

  return POST(
    new Request('http://localhost/api/websites/website-1/segments/segment-1', { method: 'POST' }),
    { params: Promise.resolve({ websiteId: 'website-1', segmentId: 'segment-1' }) },
  );
}

beforeEach(() => {
  parseRequestMock.mockReset();
  canUpdateWebsiteMock.mockReset().mockResolvedValue(true);
  canViewSharedWebsiteMock.mockReset().mockResolvedValue(true);
  getWebsiteSegmentMock.mockReset().mockResolvedValue({ id: 'segment-1' } as any);
  updateSegmentMock.mockReset().mockResolvedValue({ id: 'segment-1' } as any);
});

// Updates follow the same rules as creation, so an edit can't strip what the forms require.
test('requires a name', async () => {
  await post({ type: 'segment', name: 'Everyone', parameters: {} });
  const schema = parseRequestMock.mock.calls[0][1] as {
    safeParse: (value: unknown) => { success: boolean };
  };

  expect(schema.safeParse({ type: 'segment', name: '', parameters: {} }).success).toBe(false);
});

test.each([
  ['no action', { dateRange: '30day' }],
  ['no date range', { action: { type: 'event', value: 'signup' } }],
])('rejects a cohort update with %s', async (_label, parameters) => {
  const response = await post({ type: 'cohort', name: 'Signups', parameters });

  expect(response.status).toBe(400);
  expect(updateSegmentMock).not.toHaveBeenCalled();
});

test('updates a complete cohort', async () => {
  const response = await post({
    type: 'cohort',
    name: 'Signups',
    parameters: { dateRange: '30day', action: { type: 'event', value: 'signup' } },
  });

  expect(response.status).toBe(200);
  expect(updateSegmentMock).toHaveBeenCalledTimes(1);
});

test('allows a share viewer to fetch their locked segment even when allowFilter is false', async () => {
  parseRequestMock.mockResolvedValue({
    auth: {
      authType: 'share',
      shareToken: {
        websiteId: 'website-1',
        parameters: { allowFilter: false, segment: 'segment-1' },
      },
    },
    error: undefined,
  } as any);

  const response = await GET(
    new Request('http://localhost/api/websites/website-1/segments/segment-1'),
    { params: Promise.resolve({ websiteId: 'website-1', segmentId: 'segment-1' }) },
  );

  expect(response.status).toBe(200);
  expect(getWebsiteSegmentMock).toHaveBeenCalledWith('website-1', 'segment-1');
});

test('rejects a share viewer fetching a different segment than their locked segment', async () => {
  parseRequestMock.mockResolvedValue({
    auth: {
      authType: 'share',
      shareToken: {
        websiteId: 'website-1',
        parameters: { allowFilter: true, segment: 'segment-locked' },
      },
    },
    error: undefined,
  } as any);

  const response = await GET(
    new Request('http://localhost/api/websites/website-1/segments/segment-other'),
    { params: Promise.resolve({ websiteId: 'website-1', segmentId: 'segment-other' }) },
  );

  expect(response.status).toBe(401);
  expect(getWebsiteSegmentMock).not.toHaveBeenCalled();
});

test('rejects a share viewer without a locked segment when allowFilter is false', async () => {
  parseRequestMock.mockResolvedValue({
    auth: {
      authType: 'share',
      shareToken: {
        websiteId: 'website-1',
        parameters: { allowFilter: false },
      },
    },
    error: undefined,
  } as any);

  const response = await GET(
    new Request('http://localhost/api/websites/website-1/segments/segment-1'),
    { params: Promise.resolve({ websiteId: 'website-1', segmentId: 'segment-1' }) },
  );

  expect(response.status).toBe(401);
  expect(getWebsiteSegmentMock).not.toHaveBeenCalled();
});
