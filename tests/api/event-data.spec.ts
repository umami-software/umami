import { expect, test } from './fixtures';
import { dateRange, TIMEZONE } from './helpers/dates';

/**
 * Seeded event data on `seed.website` (see seed/dataset.ts):
 * - `purchase` x9 (3 identified personas x 3 days) with revenue 49.5 / 59.5 / 69.5,
 *   currency 'USD', quantity 2, items ['sku-1','sku-2'], orderedAt (date), premium (boolean).
 * - `signup` x6 with plan 'free' | 'pro' and seats 1..6.
 * - `download` x6 with file 'guide.pdf'.
 * Other specs may ingest extra events concurrently, so list assertions use `toContain`
 * while `purchase`-scoped aggregates are asserted exactly.
 */

const PURCHASE_REVENUES = [49.5, 59.5, 69.5];
const PURCHASE_TOTAL = PURCHASE_REVENUES.reduce((sum, value) => sum + value, 0) * 3;

test.describe('Event data', () => {
  let base = '';

  test.beforeAll(({ seed }) => {
    base = `/api/websites/${seed.website.id}`;
  });

  test('GET /api/websites/{websiteId}/event-data lists events with their properties', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.get(`${base}/event-data`, {
      params: dateRange(seed, { pageSize: 5 }),
    });
    const filtered = await admin.get(`${base}/event-data`, {
      params: dateRange(seed, { event: 'purchase', pageSize: 100 }),
    });
    const shared = await (await share()).get(`${base}/event-data`, { params: dateRange(seed) });
    const denied = await viewer.get(`${base}/event-data`, { params: dateRange(seed) });
    const missingRange = await admin.get(`${base}/event-data`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: expect.any(Array),
      count: expect.any(Number),
      page: 1,
      pageSize: 5,
    });
    expect(response.body.data.length).toBeLessThanOrEqual(5);
    expect(response.body.data[0]).toMatchObject({
      websiteId: seed.website.id,
      eventId: expect.any(String),
      eventName: expect.any(String),
      eventProperties: expect.arrayContaining([
        expect.objectContaining({ dataKey: expect.any(String), dataType: expect.any(Number) }),
      ]),
    });

    expect(filtered.status).toBe(200);
    expect(filtered.body.data.length).toBeGreaterThanOrEqual(9);
    for (const row of filtered.body.data) {
      expect(row.eventName).toBe('purchase');
      expect(row.eventProperties.map((p: any) => p.dataKey)).toEqual(
        expect.arrayContaining([
          'revenue',
          'currency',
          'quantity',
          'items',
          'orderedAt',
          'premium',
        ]),
      );
    }

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingRange.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/event-data/{eventId} returns the raw rows of one event', async ({
    admin,
    viewer,
    seed,
  }) => {
    const response = await admin.get(`${base}/event-data/${seed.data.eventId}`);
    const denied = await viewer.get(`${base}/event-data/${seed.data.eventId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    for (const row of response.body) {
      expect(row).toMatchObject({
        websiteId: seed.website.id,
        eventId: seed.data.eventId,
        dataKey: expect.any(String),
        dataType: expect.any(Number),
        createdAt: expect.any(String),
      });
    }

    const byKey = Object.fromEntries(response.body.map((row: any) => [row.dataKey, row]));
    expect(byKey.currency).toMatchObject({ stringValue: seed.data.currency, dataType: 1 });
    expect(PURCHASE_REVENUES).toContain(Number(byKey.revenue.numberValue));
    expect(byKey.revenue.dataType).toBe(2);
    expect(byKey.premium.dataType).toBe(3);
    expect(byKey.orderedAt.dataType).toBe(4);
    expect(byKey.orderedAt.dateValue).toEqual(expect.any(String));
    expect(byKey.items.dataType).toBe(5);

    expect(denied.status).toBe(401);
  });

  test('GET /api/websites/{websiteId}/event-data/events breaks properties down per value', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.get(`${base}/event-data/events`, { params: dateRange(seed) });
    // Note: this endpoint filters on `event`, while /fields uses `eventName`.
    const filtered = await admin.get(`${base}/event-data/events`, {
      params: dateRange(seed, { event: 'purchase' }),
    });
    const shared = await (await share()).get(`${base}/event-data/events`, {
      params: dateRange(seed),
    });
    const denied = await viewer.get(`${base}/event-data/events`, { params: dateRange(seed) });
    const missingRange = await admin.get(`${base}/event-data/events`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventName: expect.any(String),
          propertyName: expect.any(String),
          dataType: expect.any(Number),
          total: expect.any(Number),
        }),
      ]),
    );

    expect(filtered.status).toBe(200);
    expect(filtered.body.every((row: any) => row.eventName === 'purchase')).toBe(true);
    expect(filtered.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          propertyName: 'currency',
          propertyValue: seed.data.currency,
          dataType: 1,
          total: 9,
        }),
      ]),
    );

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingRange.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/event-data/fields lists the properties of an event', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.get(`${base}/event-data/fields`, {
      params: dateRange(seed, { eventName: 'purchase' }),
    });
    const all = await admin.get(`${base}/event-data/fields`, { params: dateRange(seed) });
    const shared = await (await share()).get(`${base}/event-data/fields`, {
      params: dateRange(seed),
    });
    const denied = await viewer.get(`${base}/event-data/fields`, { params: dateRange(seed) });
    const missingRange = await admin.get(`${base}/event-data/fields`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        { propertyName: 'currency', dataType: 1, total: 9 },
        { propertyName: 'revenue', dataType: 2, total: 9 },
        { propertyName: 'premium', dataType: 3, total: 9 },
        { propertyName: 'orderedAt', dataType: 4, total: 9 },
        { propertyName: 'items', dataType: 5, total: 9 },
        { propertyName: 'quantity', dataType: 2, total: 9 },
      ]),
    );

    expect(all.status).toBe(200);
    expect(all.body.map((row: any) => row.propertyName)).toEqual(
      expect.arrayContaining(['revenue', 'plan', 'seats', 'file']),
    );

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingRange.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/event-data/properties lists properties per event', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.get(`${base}/event-data/properties`, {
      params: dateRange(seed),
    });
    const shared = await (await share()).get(`${base}/event-data/properties`, {
      params: dateRange(seed),
    });
    const denied = await viewer.get(`${base}/event-data/properties`, { params: dateRange(seed) });
    const missingRange = await admin.get(`${base}/event-data/properties`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        { eventName: 'purchase', propertyName: 'revenue', dataType: 2, total: 9 },
        { eventName: 'signup', propertyName: 'plan', dataType: 1, total: 6 },
        { eventName: 'signup', propertyName: 'seats', dataType: 2, total: 6 },
        { eventName: 'download', propertyName: 'file', dataType: 1, total: 6 },
      ]),
    );

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingRange.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/event-data/stats returns totals', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.get(`${base}/event-data/stats`, { params: dateRange(seed) });
    const shared = await (await share()).get(`${base}/event-data/stats`, {
      params: dateRange(seed),
    });
    const denied = await viewer.get(`${base}/event-data/stats`, { params: dateRange(seed) });
    const missingRange = await admin.get(`${base}/event-data/stats`);

    expect(response.status).toBe(200);
    expect(Object.keys(response.body).sort()).toEqual(['events', 'properties', 'records']);
    // 9 purchases + 6 signups + 6 downloads (other specs may add more).
    expect(Number(response.body.events)).toBeGreaterThanOrEqual(21);
    // purchase: 6 props, signup: 2, download: 1.
    expect(Number(response.body.properties)).toBeGreaterThanOrEqual(9);
    // 9*6 + 6*2 + 6*1 = 72 property records.
    expect(Number(response.body.records)).toBeGreaterThanOrEqual(72);

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingRange.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/event-data/values returns value counts for a property', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.get(`${base}/event-data/values`, {
      params: dateRange(seed, { propertyName: 'plan', eventName: 'signup' }),
    });
    const typed = await admin.get(`${base}/event-data/values`, {
      params: dateRange(seed, { propertyName: 'revenue', eventName: 'purchase', dataType: 2 }),
    });
    const shared = await (await share()).get(`${base}/event-data/values`, {
      params: dateRange(seed, { propertyName: 'plan' }),
    });
    const denied = await viewer.get(`${base}/event-data/values`, {
      params: dateRange(seed, { propertyName: 'plan' }),
    });
    const missingProperty = await admin.get(`${base}/event-data/values`, {
      params: dateRange(seed),
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        { value: 'free', total: 3 },
        { value: 'pro', total: 3 },
      ]),
    );

    expect(typed.status).toBe(200);
    expect(typed.body.map((row: any) => Number(row.value)).sort()).toEqual(PURCHASE_REVENUES);
    expect(typed.body.every((row: any) => row.total === 3)).toBe(true);

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingProperty.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/event-data-pivot pivots event properties into columns', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.get(`${base}/event-data-pivot`, {
      params: dateRange(seed, {
        eventName: 'purchase',
        timezone: TIMEZONE,
        unit: 'day',
        pageSize: 100,
      }),
    });
    const paged = await admin.get(`${base}/event-data-pivot`, {
      params: dateRange(seed, { eventName: 'purchase', page: 2, pageSize: 4 }),
    });
    const propertyFiltered = await admin.get(`${base}/event-data-pivot`, {
      params: dateRange(seed, { eventName: 'purchase', pf_premium: '3.eq.true', pageSize: 100 }),
    });
    const shared = await (await share()).get(`${base}/event-data-pivot`, {
      params: dateRange(seed, { eventName: 'purchase' }),
    });
    const denied = await viewer.get(`${base}/event-data-pivot`, {
      params: dateRange(seed, { eventName: 'purchase' }),
    });
    const missingEvent = await admin.get(`${base}/event-data-pivot`, {
      params: dateRange(seed),
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ count: 9, page: 1, pageSize: 100 });
    expect(response.body.data).toHaveLength(9);
    for (const row of response.body.data) {
      expect(row).toMatchObject({
        eventId: expect.any(String),
        sessionId: expect.any(String),
        eventName: 'purchase',
        urlPath: '/',
        createdAt: expect.any(String),
        propertyKeys: expect.any(Array),
        propertyValues: expect.any(Array),
      });
      // Key order is backend-specific (Postgres sorts, ClickHouse keeps insertion order).
      expect([...row.propertyKeys].sort()).toEqual([
        'currency',
        'items',
        'orderedAt',
        'premium',
        'quantity',
        'revenue',
      ]);
      expect(row.propertyValues).toHaveLength(row.propertyKeys.length);
      expect(row.propertyValues[row.propertyKeys.indexOf('currency')]).toBe(seed.data.currency);
    }

    expect(paged.status).toBe(200);
    expect(paged.body).toMatchObject({ count: 9, page: 2, pageSize: 4 });
    expect(paged.body.data).toHaveLength(4);

    // Only alice (persona index 0) buys with premium=true: 3 purchases.
    expect(propertyFiltered.status).toBe(200);
    expect(propertyFiltered.body.count).toBe(3);
    expect(
      propertyFiltered.body.data.every(
        (row: any) => row.propertyValues[row.propertyKeys.indexOf('premium')] === 'true',
      ),
    ).toBe(true);

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingEvent.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/event-data-pivot/array-series expands array properties over time', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const params = dateRange(seed, { eventName: 'purchase', propertyName: 'items' });
    const response = await admin.get(`${base}/event-data-pivot/array-series`, { params });
    const shared = await (await share()).get(`${base}/event-data-pivot/array-series`, { params });
    const denied = await viewer.get(`${base}/event-data-pivot/array-series`, { params });
    const missingProperty = await admin.get(`${base}/event-data-pivot/array-series`, {
      params: dateRange(seed, { eventName: 'purchase' }),
    });

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    for (const point of response.body) {
      expect(point).toEqual({
        x: expect.any(String),
        t: expect.any(String),
        y: expect.any(Number),
      });
    }
    expect(new Set(response.body.map((point: any) => point.x))).toEqual(
      new Set(['sku-1', 'sku-2']),
    );
    // Every purchase carries both skus: 9 occurrences each.
    for (const sku of ['sku-1', 'sku-2']) {
      const total = response.body
        .filter((point: any) => point.x === sku)
        .reduce((sum: number, point: any) => sum + point.y, 0);
      expect(total).toBe(9);
    }

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingProperty.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/event-data-pivot/date-series counts date properties', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const params = dateRange(seed, { eventName: 'purchase', propertyName: 'orderedAt' });
    const response = await admin.get(`${base}/event-data-pivot/date-series`, { params });
    const shared = await (await share()).get(`${base}/event-data-pivot/date-series`, { params });
    const denied = await viewer.get(`${base}/event-data-pivot/date-series`, { params });
    const missingEvent = await admin.get(`${base}/event-data-pivot/date-series`, {
      params: dateRange(seed, { propertyName: 'orderedAt' }),
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(9);
    for (const point of response.body) {
      expect(point).toEqual({ t: expect.any(String), y: 1 });
      expect(Number.isNaN(new Date(point.t).getTime())).toBe(false);
    }

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingEvent.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/event-data-pivot/numeric-series aggregates numeric properties', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const params = dateRange(seed, {
      eventName: 'purchase',
      propertyName: 'revenue',
      unit: 'day',
      timezone: TIMEZONE,
    });
    const sum = await admin.get(`${base}/event-data-pivot/numeric-series`, { params });
    const avg = await admin.get(`${base}/event-data-pivot/numeric-series`, {
      params: { ...params, metric: 'avg' },
    });
    const count = await admin.get(`${base}/event-data-pivot/numeric-series`, {
      params: { ...params, metric: 'count' },
    });
    const shared = await (await share()).get(`${base}/event-data-pivot/numeric-series`, {
      params,
    });
    const denied = await viewer.get(`${base}/event-data-pivot/numeric-series`, { params });
    const badMetric = await admin.get(`${base}/event-data-pivot/numeric-series`, {
      params: { ...params, metric: 'max' },
    });
    const missingProperty = await admin.get(`${base}/event-data-pivot/numeric-series`, {
      params: dateRange(seed, { eventName: 'purchase' }),
    });

    // Purchases happen on 3 distinct days, 3 per day.
    expect(sum.status).toBe(200);
    expect(sum.body).toHaveLength(3);
    for (const point of sum.body) {
      expect(point).toEqual({ t: expect.any(String), y: expect.anything() });
      expect(Number(point.y)).toBeCloseTo(PURCHASE_TOTAL / 3, 5);
    }

    expect(avg.status).toBe(200);
    expect(avg.body).toHaveLength(3);
    for (const point of avg.body) {
      expect(Number(point.y)).toBeCloseTo(59.5, 5);
    }

    expect(count.status).toBe(200);
    expect(count.body).toHaveLength(3);
    for (const point of count.body) {
      expect(Number(point.y)).toBe(3);
    }

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(badMetric.status).toBe(400);
    expect(missingProperty.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/event-data-pivot/numeric-stats summarises a numeric property', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const params = dateRange(seed, { eventName: 'purchase', propertyName: 'revenue' });
    const response = await admin.get(`${base}/event-data-pivot/numeric-stats`, { params });
    const shared = await (await share()).get(`${base}/event-data-pivot/numeric-stats`, { params });
    const denied = await viewer.get(`${base}/event-data-pivot/numeric-stats`, { params });
    const missingProperty = await admin.get(`${base}/event-data-pivot/numeric-stats`, {
      params: dateRange(seed, { eventName: 'purchase' }),
    });

    expect(response.status).toBe(200);
    expect(Object.keys(response.body).sort()).toEqual(['average', 'max', 'median', 'min', 'total']);
    expect(Number(response.body.min)).toBeCloseTo(49.5, 5);
    expect(Number(response.body.max)).toBeCloseTo(69.5, 5);
    expect(Number(response.body.average)).toBeCloseTo(59.5, 5);
    expect(Number(response.body.median)).toBeCloseTo(59.5, 5);
    expect(Number(response.body.total)).toBeCloseTo(PURCHASE_TOTAL, 5);

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingProperty.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/event-data-pivot/property-series counts property values over time', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const premium = await admin.get(`${base}/event-data-pivot/property-series`, {
      params: dateRange(seed, {
        eventName: 'purchase',
        propertyName: 'premium',
        unit: 'day',
        timezone: TIMEZONE,
      }),
    });
    const plan = await admin.get(`${base}/event-data-pivot/property-series`, {
      params: dateRange(seed, { eventName: 'signup', propertyName: 'plan', unit: 'day' }),
    });
    const shared = await (await share()).get(`${base}/event-data-pivot/property-series`, {
      params: dateRange(seed, { eventName: 'signup', propertyName: 'plan' }),
    });
    const denied = await viewer.get(`${base}/event-data-pivot/property-series`, {
      params: dateRange(seed, { eventName: 'signup', propertyName: 'plan' }),
    });
    const missingProperty = await admin.get(`${base}/event-data-pivot/property-series`, {
      params: dateRange(seed, { eventName: 'signup' }),
    });

    expect(premium.status).toBe(200);
    // 3 days x (2 non-premium + 1 premium).
    expect(premium.body).toHaveLength(6);
    for (const point of premium.body) {
      expect(point).toEqual({
        x: expect.any(String),
        t: expect.any(String),
        y: expect.any(Number),
      });
    }
    const totals = (rows: any[]) =>
      rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.x] = (acc[row.x] ?? 0) + row.y;
        return acc;
      }, {});
    expect(totals(premium.body)).toEqual({ true: 3, false: 6 });

    expect(plan.status).toBe(200);
    expect(totals(plan.body)).toEqual({ pro: 3, free: 3 });

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingProperty.status).toBe(400);
  });
});
