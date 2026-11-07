import { beforeEach, expect, test, vi } from 'vitest';
import { ENTITY_TYPE } from '@/lib/constants';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { canViewWebsite } from '@/permissions/website';
import { getRealtimeData } from '@/queries/sql';
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

vi.mock('@/queries/sql', () => ({
  getRealtimeData: vi.fn(),
}));

const realtimeData = {
  countries: { US: 1 },
  urls: { '/': 1 },
  referrers: {},
  events: [{ __type: 'pageview', sessionId: 'session-1', urlPath: '/', country: 'US' }],
  series: { views: [{ x: '2026-10-26T00:00:00Z', y: 1 }], visitors: [] },
  totals: { views: 1, visitors: 1, events: 0, countries: 1 },
  timestamp: 0,
};

const params = Promise.resolve({ websiteId: 'website-1' });

function mockAuth(auth: any) {
  vi.mocked(parseRequest).mockResolvedValue({ auth, query: {}, error: undefined } as any);
}

async function getRealtime() {
  return GET(new Request('http://localhost/api/realtime/website-1'), { params });
}

beforeEach(() => {
  vi.mocked(canViewWebsite).mockReset();
  vi.mocked(getQueryFilters).mockResolvedValue({} as any);
  vi.mocked(getRealtimeData).mockResolvedValue(realtimeData as any);
});

// Board realtime components only render totals and series. The event log carries
// per-visitor rows (session id, path, device, country), so a public board link must
// not expose it, while the board's realtime widgets keep working.
test('board shares get realtime aggregates without the visitor event log', async () => {
  mockAuth({
    shareToken: { shareType: ENTITY_TYPE.board, websiteIds: ['website-1'], parameters: {} },
  });

  const response = await getRealtime();
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.events).toEqual([]);
  expect(body.series).toEqual(realtimeData.series);
  expect(body.totals).toEqual(realtimeData.totals);
});

// The realtime page for a shared website renders the event log, so it must stay intact.
test('website shares with realtime enabled keep the visitor event log', async () => {
  mockAuth({
    shareToken: {
      shareType: ENTITY_TYPE.website,
      websiteId: 'website-1',
      parameters: { realtime: true },
    },
  });

  const body = await (await getRealtime()).json();

  expect(body.events).toEqual(realtimeData.events);
});

test('logged-in users with website access keep the visitor event log', async () => {
  vi.mocked(canViewWebsite).mockResolvedValue(true);
  mockAuth({ user: { id: 'user-1' } });

  const body = await (await getRealtime()).json();

  expect(body.events).toEqual(realtimeData.events);
});

test('shares without realtime access are still rejected', async () => {
  mockAuth({
    shareToken: {
      shareType: ENTITY_TYPE.website,
      websiteId: 'website-1',
      parameters: { overview: true },
    },
  });

  const response = await getRealtime();

  expect(response.status).toBe(401);
  expect(getRealtimeData).not.toHaveBeenCalled();
});
