import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { GET } from './route';

const mocks = vi.hoisted(() => ({
  users: vi.fn(),
  teams: vi.fn(),
  websites: vi.fn(),
  websiteEvents: vi.fn(),
  sessions: vi.fn(),
  clickhouse: vi.fn(),
}));

vi.mock('@/lib/request', () => ({ parseRequest: vi.fn() }));
vi.mock('@/lib/clickhouse', () => ({ default: { rawQuery: mocks.clickhouse } }));
vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      user: { count: mocks.users },
      team: { count: mocks.teams },
      website: { count: mocks.websites },
      websiteEvent: { count: mocks.websiteEvents },
      session: { count: mocks.sessions },
    },
  },
}));

const request = (section?: 'records') =>
  new Request(`http://localhost/api/admin/installation${section ? '?section=records' : ''}`);

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('CLOUD_MODE', undefined);
  vi.stubEnv('ENABLE_SETTINGS', undefined);
  vi.stubEnv('CLICKHOUSE_URL', undefined);
  vi.mocked(parseRequest).mockImplementation(async (request, schema) => ({
    auth: { authType: 'session', user: { isAdmin: true } },
    query: schema.parse(Object.fromEntries(new URL(request.url).searchParams)),
  }));
});

afterEach(() => vi.unstubAllEnvs());

test.each([
  { cloudMode: undefined, enableSettings: undefined, isAdmin: true },
  { cloudMode: '1', enableSettings: '1', isAdmin: false },
])(
  'returns inventory with ENABLE_SETTINGS=$enableSettings and isAdmin=$isAdmin',
  async ({ cloudMode, enableSettings, isAdmin }) => {
    vi.stubEnv('CLOUD_MODE', cloudMode);
    vi.stubEnv('ENABLE_SETTINGS', enableSettings);
    vi.mocked(parseRequest).mockResolvedValue({
      auth: { authType: 'session', user: { isAdmin } },
      query: {},
    });
    mocks.users.mockResolvedValue(4);
    mocks.teams.mockResolvedValue(2);
    mocks.websites.mockResolvedValue(6);

    const response = await GET(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ users: 4, teams: 2, websites: 6 });
    for (const count of [mocks.users, mocks.teams, mocks.websites]) {
      expect(count).toHaveBeenCalledWith({ where: { deletedAt: null } });
    }
    expect(mocks.websiteEvents).not.toHaveBeenCalled();
    expect(mocks.sessions).not.toHaveBeenCalled();
    expect(mocks.clickhouse).not.toHaveBeenCalled();
  },
);

test('counts all website event and session rows in PostgreSQL', async () => {
  mocks.websiteEvents.mockResolvedValue(8);
  mocks.sessions.mockResolvedValue(3);

  const response = await GET(request('records'));

  expect(await response.json()).toEqual({ websiteEvents: 8, sessions: 3 });
  expect(mocks.websiteEvents).toHaveBeenCalledWith();
  expect(mocks.sessions).toHaveBeenCalledWith();
});

test('counts ClickHouse event rows and PostgreSQL session rows when ClickHouse is enabled', async () => {
  vi.stubEnv('CLICKHOUSE_URL', 'http://localhost:8123/umami');
  mocks.clickhouse.mockResolvedValue([{ count: 28 }]);
  mocks.sessions.mockResolvedValue(0);

  const response = await GET(request('records'));

  expect(await response.json()).toEqual({ websiteEvents: 28, sessions: 0 });
  expect(mocks.clickhouse).toHaveBeenCalledWith('select count(*) as count from website_event');
  expect(mocks.websiteEvents).not.toHaveBeenCalled();
  expect(mocks.sessions).toHaveBeenCalledWith();
});

test.each([
  { auth: { authType: 'session', user: { isAdmin: false } }, enableSettings: undefined },
  { auth: { authType: 'api-key', user: { isAdmin: true } }, enableSettings: '1' },
  { auth: { authType: 'share' }, enableSettings: '1' },
])('rejects $auth with ENABLE_SETTINGS=$enableSettings', async ({ auth, enableSettings }) => {
  vi.stubEnv('ENABLE_SETTINGS', enableSettings);
  vi.mocked(parseRequest).mockResolvedValue({ auth, query: {} });

  expect((await GET(request())).status).toBe(403);
  expect(mocks.users).not.toHaveBeenCalled();
  expect(mocks.websiteEvents).not.toHaveBeenCalled();
  expect(mocks.sessions).not.toHaveBeenCalled();
});

test('disables installation stats in Cloud mode by default', async () => {
  vi.stubEnv('CLOUD_MODE', '1');

  expect((await GET(request())).status).toBe(404);
  expect(parseRequest).not.toHaveBeenCalled();
});
