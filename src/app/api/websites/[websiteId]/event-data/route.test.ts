import { beforeEach, expect, test, vi } from 'vitest';
import { ENTITY_TYPE } from '@/lib/constants';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { getEventData } from '@/queries/sql/events/getEventData';
import { GET } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
  getQueryFilters: vi.fn(),
}));

// Use the real share permission logic so the test covers how share types are scoped.
vi.mock('@/permissions', async () => import('@/permissions/share'));

vi.mock('@/permissions/website', () => ({
  canViewWebsite: vi.fn(),
}));

vi.mock('@/queries/sql/events/getEventData', () => ({
  getEventData: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const getEventDataMock = vi.mocked(getEventData);

function request(shareToken: Record<string, any>) {
  parseRequestMock.mockResolvedValue({
    auth: { shareToken, authType: 'share' },
    query: {},
    error: undefined,
  } as any);

  return GET(new Request('http://localhost/api/websites/website-1/event-data'), {
    params: Promise.resolve({ websiteId: 'website-1' }),
  });
}

beforeEach(() => {
  parseRequestMock.mockReset();
  getEventDataMock.mockReset();
  vi.mocked(getQueryFilters).mockResolvedValue({} as any);
  getEventDataMock.mockResolvedValue({ data: [], count: 0, page: 1, pageSize: 20 } as any);
});

test('board shares cannot read individual event rows and their property values', async () => {
  // Board components only render aggregates; this endpoint returns each event with its
  // properties, which a public board link must not expose.
  const response = await request({
    shareType: ENTITY_TYPE.board,
    websiteIds: ['website-1'],
    parameters: {},
  });

  expect(response.status).toBe(401);
  expect(getEventDataMock).not.toHaveBeenCalled();
});

test('website shares with the events section can still read event rows', async () => {
  const response = await request({
    shareType: ENTITY_TYPE.website,
    websiteId: 'website-1',
    parameters: { events: true },
  });

  expect(response.status).toBe(200);
  expect(getEventDataMock).toHaveBeenCalled();
});
