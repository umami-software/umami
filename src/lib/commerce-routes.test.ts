import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  denied: new Set<string>(),
  normalized: {
    startDate: new Date(1500),
    endDate: new Date(2000),
    unit: 'day',
    timezone: 'UTC',
  },
  query: vi.fn(async (..._args: any[]) => ({ ok: true })),
  order: vi.fn(async (..._args: any[]) => ({ id: 'order' }) as any),
}));

vi.mock('@/permissions', () => ({
  canViewWebsiteSection: vi.fn(
    async (_auth: unknown, _websiteId: string, section: string) => !mocks.denied.has(section),
  ),
}));
vi.mock('@/lib/request', () => ({
  parseRequest: async (request: Request, schema?: any) => {
    if (!schema) return { auth: {} };
    const result = schema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
    return result.success
      ? { auth: {}, query: result.data }
      : { error: () => new Response(null, { status: 400 }) };
  },
  getQueryFilters: vi.fn(async () => mocks.normalized),
}));
vi.mock('@/queries/sql/commerce/getCommerceCurrencies', () => ({
  getCommerceCurrencies: mocks.query,
}));
vi.mock('@/queries/sql/commerce/getCommerceStats', () => ({ getCommerceStats: mocks.query }));
vi.mock('@/queries/sql/commerce/getCommerceChart', () => ({ getCommerceChart: mocks.query }));
vi.mock('@/queries/sql/commerce/getCommerceMetrics', () => ({ getCommerceMetrics: mocks.query }));
vi.mock('@/queries/sql/commerce/getCommerceOrders', () => ({ getCommerceOrders: mocks.query }));
vi.mock('@/queries/sql/commerce/getCommerceOrder', () => ({ getCommerceOrder: mocks.order }));
vi.mock('@/queries/sql/commerce/getCommerceProducts', () => ({ getCommerceProducts: mocks.query }));
vi.mock('@/queries/sql/commerce/getCommerceBaskets', () => ({ getCommerceBaskets: mocks.query }));
vi.mock('@/queries/sql/commerce/getCommerceCheckout', () => ({
  getCommerceCheckout: mocks.query,
  getCommerceAbandonedCheckouts: mocks.query,
}));
vi.mock('@/queries/sql/commerce/getCommerceCustomers', () => ({
  getCommerceCustomers: mocks.query,
  getCommerceBuyers: mocks.query,
}));
vi.mock('@/queries/sql/commerce/getCommerceAttribution', () => ({
  getCommerceAttribution: mocks.query,
}));
vi.mock('@/queries/sql/breakdown/getBreakdown', () => ({ getBreakdown: mocks.query }));

import { GET as breakdown } from '@/app/api/websites/[websiteId]/breakdown/route';
import { GET as abandoned } from '@/app/api/websites/[websiteId]/commerce/abandoned/route';
import { GET as attribution } from '@/app/api/websites/[websiteId]/commerce/attribution/route';
import { GET as baskets } from '@/app/api/websites/[websiteId]/commerce/baskets/route';
import { GET as buyers } from '@/app/api/websites/[websiteId]/commerce/buyers/route';
import { GET as chart } from '@/app/api/websites/[websiteId]/commerce/chart/route';
import { GET as checkout } from '@/app/api/websites/[websiteId]/commerce/checkout/route';
import { GET as currencies } from '@/app/api/websites/[websiteId]/commerce/currencies/route';
import { GET as customers } from '@/app/api/websites/[websiteId]/commerce/customers/route';
import { GET as metrics } from '@/app/api/websites/[websiteId]/commerce/metrics/route';
import { GET as order } from '@/app/api/websites/[websiteId]/commerce/orders/[commerceEventId]/route';
import { GET as orders } from '@/app/api/websites/[websiteId]/commerce/orders/route';
import { GET as products } from '@/app/api/websites/[websiteId]/commerce/products/route';
import { GET as stats } from '@/app/api/websites/[websiteId]/commerce/stats/route';

const context = { params: Promise.resolve({ websiteId: 'website' }) };
const request = (params: Record<string, string> = {}) =>
  new Request(
    `https://example.org/api?${new URLSearchParams({ startAt: '1000', endAt: '2000', ...params })}`,
  );

const scoped = [
  ['stats', stats, {}],
  ['chart', chart, {}],
  ['metrics', metrics, { type: 'channel' }],
  ['orders', orders, {}],
  ['products', products, { groupBy: 'variant', sort: 'units' }],
  ['baskets', baskets, {}],
  ['checkout', checkout, {}],
  ['abandoned', abandoned, {}],
  ['customers', customers, {}],
  ['buyers', buyers, {}],
  ['attribution', attribution, { model: 'first-click' }],
] as const;

beforeEach(() => {
  mocks.denied.clear();
  mocks.query.mockClear();
  mocks.order.mockClear();
});

describe.each(scoped)('commerce %s GET', (_name, handler, params) => {
  test('passes normalized dates and the uppercased currency for the path website', async () => {
    const response = await handler(request({ currency: 'eur', market: 'DE', ...params }), context);

    expect(response.status).toBe(200);
    const [websiteId, parameters] = mocks.query.mock.calls[0];
    expect(websiteId).toBe('website');
    expect(parameters).toMatchObject({
      startDate: mocks.normalized.startDate,
      endDate: mocks.normalized.endDate,
      currency: 'EUR',
      market: 'DE',
    });
  });

  test('requires a valid currency', async () => {
    expect((await handler(request(params), context)).status).toBe(400);
    expect((await handler(request({ currency: 'EURO', ...params }), context)).status).toBe(400);
    expect(mocks.query).not.toHaveBeenCalled();
  });

  test('requires the commerce section', async () => {
    mocks.denied.add('commerce');

    expect((await handler(request({ currency: 'EUR', ...params }), context)).status).toBe(401);
    expect(mocks.query).not.toHaveBeenCalled();
  });
});

test('stats returns the comparison period', async () => {
  await stats(request({ currency: 'EUR', compare: 'prev' }), context);

  const [current, previous] = mocks.query.mock.calls.map(call => call[1]);
  expect(current.startDate).toEqual(mocks.normalized.startDate);
  expect(+previous.endDate).toBeLessThanOrEqual(+current.startDate);
});

test('metrics rejects unknown dimensions', async () => {
  expect((await metrics(request({ currency: 'EUR', type: 'password' }), context)).status).toBe(400);
});

test('currencies does not require a currency', async () => {
  expect((await currencies(request(), context)).status).toBe(200);
});

test('buyers also require the sessions section, because buyers are identified visitors', async () => {
  mocks.denied.add('sessions');

  expect((await buyers(request({ currency: 'EUR' }), context)).status).toBe(401);
  expect((await customers(request({ currency: 'EUR' }), context)).status).toBe(200);
});

test('attribution defaults to last click', async () => {
  await attribution(request({ currency: 'EUR' }), context);

  expect(mocks.query.mock.calls[0][3]).toBe('last-click');
});

describe('order detail', () => {
  const orderContext = (commerceEventId: string) => ({
    params: Promise.resolve({
      websiteId: '0c0c0c0c-0000-4000-8000-000000000001',
      commerceEventId,
    }),
  });

  test('validates the ID and returns 404 when missing', async () => {
    expect((await order(new Request('https://example.org/api'), orderContext('nope'))).status).toBe(
      400,
    );

    mocks.order.mockResolvedValueOnce(null);
    expect(
      (
        await order(
          new Request('https://example.org/api'),
          orderContext('0c0c0c0c-0000-4000-8000-000000000002'),
        )
      ).status,
    ).toBe(404);
  });

  test('requires the commerce section', async () => {
    mocks.denied.add('commerce');

    expect(
      (
        await order(
          new Request('https://example.org/api'),
          orderContext('0c0c0c0c-0000-4000-8000-000000000002'),
        )
      ).status,
    ).toBe(401);
  });
});

test('breakdown revenue columns require the commerce section', async () => {
  mocks.denied.add('commerce');

  expect((await breakdown(request({ fields: '["path"]' }), context)).status).toBe(200);
  expect((await breakdown(request({ fields: '["path"]', currency: 'EUR' }), context)).status).toBe(
    401,
  );
});
