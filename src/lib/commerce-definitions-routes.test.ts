import { beforeEach, expect, test, vi } from 'vitest';

const state = vi.hoisted(() => ({
  canView: true,
  canUpdate: true,
  report: null as any,
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  products: vi.fn(async () => ({ data: [], count: 0, page: 1, pageSize: 20 })),
  checkout: vi.fn(async () => ({})),
  filters: vi.fn(async (q: any) => ({
    ...q,
    startDate: new Date(q.startAt),
    endDate: new Date(q.endAt),
  })),
}));
vi.mock('@/lib/request', () => ({
  parseRequest: async (request: Request, schema?: any) => {
    const raw =
      request.method === 'GET'
        ? Object.fromEntries(new URL(request.url).searchParams)
        : await request.json();
    const parsed = schema ? schema.safeParse(raw) : { success: true, data: raw };
    return parsed.success
      ? { auth: { user: { id: 'user' } }, query: parsed.data, body: parsed.data }
      : { error: () => new Response(null, { status: 400 }) };
  },
  getQueryFilters: state.filters,
}));
vi.mock('@/permissions', () => ({
  canViewWebsiteSection: async () => state.canView,
  canViewReport: async () => state.canView,
  canUpdateWebsite: async () => state.canUpdate,
  canUpdateReport: async () => true,
  canDeleteReport: async () => true,
}));
vi.mock('@/queries/prisma', () => ({
  getReport: async () => state.report,
  getReports: async () => ({ data: [] }),
  createReport: state.create,
  updateReport: state.update,
  deleteReport: state.remove,
}));
vi.mock('@/queries/sql/commerce/getCommerceProducts', () => ({
  getCommerceProducts: state.products,
}));
vi.mock('@/queries/sql/commerce/getCommerceCheckout', () => ({
  getCommerceCheckout: state.checkout,
}));

import {
  GET as read,
  DELETE as remove,
  POST as update,
} from '@/app/api/websites/[websiteId]/commerce/reports/[reportId]/route';
import { GET as stats } from '@/app/api/websites/[websiteId]/commerce/reports/[reportId]/stats/route';
import { POST as create } from '@/app/api/websites/[websiteId]/commerce/reports/route';
import { commerceReportParametersSchema } from './commerce-saved-reports';

const context = { params: Promise.resolve({ websiteId: 'website', reportId: 'report' }) };
const parameters = commerceReportParametersSchema.parse({
  version: 1,
  type: 'products',
  currency: 'EUR',
  market: 'DE',
  minViews: 100,
  maxCartRate: 0.05,
  columns: ['views', 'addToCartRate'],
  date: { mode: 'fixed', startAt: 1000, endAt: 2000 },
});
const request = (method = 'GET', body?: object, query = '') =>
  new Request(`https://example.org/api${query}`, {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
beforeEach(() => {
  vi.clearAllMocks();
  state.canView = true;
  state.canUpdate = true;
  state.report = {
    id: 'report',
    websiteId: 'website',
    type: 'commerce',
    name: 'Weekly',
    parameters,
  };
  state.create.mockImplementation(async data => data);
  state.update.mockImplementation(async (_id, data) => ({ ...state.report, ...data }));
});
test('creates a complete validated definition in the website scope', async () => {
  expect((await create(request('POST', { name: 'Weekly', parameters }), context)).status).toBe(200);
  expect(state.create).toHaveBeenCalledWith(
    expect.objectContaining({ websiteId: 'website', userId: 'user', type: 'commerce', parameters }),
  );
});
test('a teammate reads and evaluates the saved scope, ignoring URL scope overrides', async () => {
  expect((await read(request(), context)).status).toBe(200);
  expect((await stats(request('GET', undefined, '?currency=USD&market=FR'), context)).status).toBe(
    200,
  );
  expect(state.products).toHaveBeenCalledWith(
    'website',
    expect.objectContaining({ currency: 'EUR', market: 'DE' }),
    expect.anything(),
    expect.objectContaining({ minViews: 100, maxCartRate: 0.05 }),
  );
  expect(state.filters.mock.calls[0][0]).toMatchObject({ startAt: 1000, endAt: 2000 });
});
test('board dates can override both bounds but cannot override one bound', async () => {
  expect((await stats(request('GET', undefined, '?startAt=3000&endAt=4000'), context)).status).toBe(
    200,
  );
  expect(state.filters.mock.calls[0][0]).toMatchObject({ startAt: 3000, endAt: 4000 });
  expect((await stats(request('GET', undefined, '?startAt=3000'), context)).status).toBe(400);
});
test('rejects another website/type, inaccessible reports and revoked editor access', async () => {
  state.report.websiteId = 'another';
  expect((await stats(request(), context)).status).toBe(404);
  state.report.websiteId = 'website';
  state.report.type = 'funnel';
  expect((await read(request(), context)).status).toBe(404);
  state.report.type = 'commerce';
  state.canView = false;
  expect((await stats(request(), context)).status).toBe(401);
  state.canUpdate = false;
  expect((await update(request('POST', { name: 'Updated', parameters }), context)).status).toBe(
    401,
  );
  expect((await remove(request('DELETE', {}), context)).status).toBe(401);
  expect(state.update).not.toHaveBeenCalled();
  expect(state.remove).not.toHaveBeenCalled();
});
test('rejects malformed definitions and preserved future versions without executing a query', async () => {
  state.report.parameters = { ...parameters, version: 999 };
  expect((await stats(request(), context)).status).toBe(400);
  expect(state.products).not.toHaveBeenCalled();
});
