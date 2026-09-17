import { beforeEach, describe, expect, test, vi } from 'vitest';

const state = vi.hoisted(() => ({
  report: null as any,
  sectionAllowed: true,
  definitionAllowed: true,
  query: vi.fn(async (..._args: any[]) => ({ num: 1, total: 2 })),
  update: vi.fn(async (..._args: any[]) => ({})),
  remove: vi.fn(),
}));
vi.mock('@/permissions', () => ({
  canViewWebsiteSection: async () => state.sectionAllowed,
  canViewReport: async () => state.definitionAllowed,
  canUpdateReport: async () => state.definitionAllowed,
  canDeleteReport: async () => state.definitionAllowed,
}));
vi.mock('@/queries/prisma', () => ({
  getReport: async () => state.report,
  updateReport: state.update,
  deleteReport: state.remove,
}));
vi.mock('@/queries/sql/goals/getGoal', () => ({ getGoal: state.query }));
vi.mock('@/queries/sql/funnels/getFunnel', () => ({ getFunnel: state.query }));
vi.mock('@/lib/request', () => ({
  parseRequest: async (request: Request, schema?: any) => {
    const input =
      request.method === 'GET'
        ? Object.fromEntries(new URL(request.url).searchParams)
        : await request.json().catch(() => ({}));
    const result = schema?.safeParse(input) ?? { success: true, data: input };
    return result.success
      ? { auth: {}, query: result.data, body: result.data }
      : { error: () => new Response(null, { status: 400 }) };
  },
  getQueryFilters: async () => ({ startDate: new Date(1500), endDate: new Date(2000) }),
}));

import * as funnel from '@/app/api/websites/[websiteId]/funnels/[funnelId]/route';
import { GET as funnelStats } from '@/app/api/websites/[websiteId]/funnels/[funnelId]/stats/route';
import * as goal from '@/app/api/websites/[websiteId]/goals/[goalId]/route';
import { GET as goalStats } from '@/app/api/websites/[websiteId]/goals/[goalId]/stats/route';

const context = { params: Promise.resolve({ websiteId: 'website', goalId: 'id', funnelId: 'id' }) };
const request = () =>
  new Request('https://example.org/api?startAt=1000&endAt=2000&type=event&value=override');

describe.each([
  ['goal', goal, goalStats, { type: 'path', value: '/saved' }],
  [
    'funnel',
    funnel,
    funnelStats,
    {
      window: 60,
      steps: [
        { type: 'path', value: '/a' },
        { type: 'event', value: 'signup' },
      ],
    },
  ],
] as const)('saved %s resources', (type, handlers, stats, parameters) => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.report = { id: 'id', websiteId: 'website', type, parameters };
    state.sectionAllowed = true;
    state.definitionAllowed = true;
  });
  test('calculates using saved criteria and normalized dates', async () => {
    expect((await stats(request(), context)).status).toBe(200);
    expect(state.query.mock.calls[0][1]).toEqual({
      ...parameters,
      startDate: new Date(1500),
      endDate: new Date(2000),
    });
  });
  test.each(['websiteId', 'type'])(
    'rejects mismatched %s for reads, writes, deletion, and stats',
    async field => {
      state.report[field] = 'other';
      const write = new Request('https://example.org/api', {
        method: 'POST',
        body: JSON.stringify({ name: 'Name', parameters }),
      });
      for (const [handler, req] of [
        [handlers.GET, request()],
        [handlers.POST, write],
        [handlers.DELETE, request()],
        [stats, request()],
      ] as const) {
        expect((await handler(req, context)).status).toBe(404);
      }
      expect(state.query).not.toHaveBeenCalled();
      expect(state.update).not.toHaveBeenCalled();
      expect(state.remove).not.toHaveBeenCalled();
    },
  );
  test('requires both definition and analytics permissions for stats', async () => {
    state.sectionAllowed = false;
    expect((await stats(request(), context)).status).toBe(401);
    state.sectionAllowed = true;
    state.definitionAllowed = false;
    expect((await stats(request(), context)).status).toBe(401);
    expect(state.query).not.toHaveBeenCalled();
  });
  test('cannot move or change type through updates', async () => {
    const req = new Request('https://example.org/api', {
      method: 'POST',
      body: JSON.stringify({ websiteId: 'other', type: 'other', name: 'Updated', parameters }),
    });
    expect((await handlers.POST(req, context)).status).toBe(200);
    expect(state.update.mock.calls[0][1]).toEqual({
      name: 'Updated',
      description: undefined,
      parameters,
    });
  });
});
