import { expect, test } from './fixtures';
import { dateRange, TIMEZONE } from './helpers/dates';

/**
 * Seeded session data on `seed.website` comes from the `identify` calls of the
 * three identified personas (see seed/dataset.ts):
 *   { plan: 'pro', seats: 5 | 6 | 7, tags: ['early-adopter','newsletter'], signedUpAt, active: true }
 * Other specs may identify extra sessions concurrently (e.g. plan 'spec'), so
 * list assertions use `toContain`; `seats`/`tags`/`signedUpAt` are only seeded here
 * and are asserted exactly.
 */

const SEATS = [5, 6, 7];
const SEATS_TOTAL = SEATS.reduce((sum, value) => sum + value, 0);

test.describe('Session data', () => {
  let base = '';

  test.beforeAll(({ seed }) => {
    base = `/api/websites/${seed.website.id}`;
  });

  test('GET /api/websites/{websiteId}/session-data-pivot pivots session properties into columns', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.get(`${base}/session-data-pivot`, {
      params: dateRange(seed, {
        propertyName: 'seats',
        timezone: TIMEZONE,
        unit: 'day',
        pageSize: 100,
      }),
    });
    const paged = await admin.get(`${base}/session-data-pivot`, {
      params: dateRange(seed, { propertyName: 'seats', page: 2, pageSize: 2 }),
    });
    const propertyFiltered = await admin.get(`${base}/session-data-pivot`, {
      params: dateRange(seed, { propertyName: 'seats', pf_seats: '2.gt.5', pageSize: 100 }),
    });
    const shared = await (await share()).get(`${base}/session-data-pivot`, {
      params: dateRange(seed, { propertyName: 'plan' }),
    });
    const denied = await viewer.get(`${base}/session-data-pivot`, {
      params: dateRange(seed, { propertyName: 'plan' }),
    });
    const missingProperty = await admin.get(`${base}/session-data-pivot`, {
      params: dateRange(seed),
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ count: 3, page: 1, pageSize: 100 });
    expect(response.body.data).toHaveLength(3);
    for (const row of response.body.data) {
      expect(row).toMatchObject({
        sessionId: expect.any(String),
        distinctId: expect.any(String),
        createdAt: expect.any(String),
        propertyKeys: expect.any(Array),
        propertyValues: expect.any(Array),
      });
      // Key order is backend-specific (Postgres sorts, ClickHouse keeps insertion order).
      expect([...row.propertyKeys].sort()).toEqual([
        'active',
        'plan',
        'seats',
        'signedUpAt',
        'tags',
      ]);
      expect(row.propertyValues).toHaveLength(5);
      expect(seed.data.distinctIds).toContain(row.distinctId);
      expect(row.propertyValues[row.propertyKeys.indexOf('plan')]).toBe('pro');
      expect(SEATS).toContain(Number(row.propertyValues[row.propertyKeys.indexOf('seats')]));
    }

    expect(paged.status).toBe(200);
    expect(paged.body).toMatchObject({ count: 3, page: 2, pageSize: 2 });
    expect(paged.body.data).toHaveLength(1);

    // seats > 5 leaves bob (6) and carol (7).
    expect(propertyFiltered.status).toBe(200);
    expect(propertyFiltered.body.count).toBe(2);
    expect(
      propertyFiltered.body.data
        .map((row: any) => Number(row.propertyValues[row.propertyKeys.indexOf('seats')]))
        .sort(),
    ).toEqual([6, 7]);

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingProperty.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/session-data/array-series expands array properties over time', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const params = dateRange(seed, { propertyName: 'tags' });
    const response = await admin.get(`${base}/session-data/array-series`, { params });
    const shared = await (await share()).get(`${base}/session-data/array-series`, { params });
    const denied = await viewer.get(`${base}/session-data/array-series`, { params });
    const missingProperty = await admin.get(`${base}/session-data/array-series`, {
      params: dateRange(seed),
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
      new Set(['early-adopter', 'newsletter']),
    );
    for (const tag of ['early-adopter', 'newsletter']) {
      const total = response.body
        .filter((point: any) => point.x === tag)
        .reduce((sum: number, point: any) => sum + point.y, 0);
      expect(total).toBe(3);
    }

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingProperty.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/session-data/date-series counts date properties', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const params = dateRange(seed, { propertyName: 'signedUpAt' });
    const response = await admin.get(`${base}/session-data/date-series`, { params });
    const shared = await (await share()).get(`${base}/session-data/date-series`, { params });
    const denied = await viewer.get(`${base}/session-data/date-series`, { params });
    const missingProperty = await admin.get(`${base}/session-data/date-series`, {
      params: dateRange(seed),
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    for (const point of response.body) {
      expect(point).toEqual({ t: expect.any(String), y: 1 });
      expect(Number.isNaN(new Date(point.t).getTime())).toBe(false);
    }

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingProperty.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/session-data/numeric-series aggregates numeric properties', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const params = dateRange(seed, { propertyName: 'seats', unit: 'day', timezone: TIMEZONE });
    const sum = await admin.get(`${base}/session-data/numeric-series`, { params });
    const avg = await admin.get(`${base}/session-data/numeric-series`, {
      params: { ...params, metric: 'avg' },
    });
    const count = await admin.get(`${base}/session-data/numeric-series`, {
      params: { ...params, metric: 'count' },
    });
    const shared = await (await share()).get(`${base}/session-data/numeric-series`, { params });
    const denied = await viewer.get(`${base}/session-data/numeric-series`, { params });
    const badMetric = await admin.get(`${base}/session-data/numeric-series`, {
      params: { ...params, metric: 'max' },
    });
    const missingProperty = await admin.get(`${base}/session-data/numeric-series`, {
      params: dateRange(seed),
    });

    const total = (rows: any[]) => rows.reduce((acc, row) => acc + Number(row.y), 0);

    // All three identify calls land on the same (backdated) day.
    expect(sum.status).toBe(200);
    expect(sum.body.length).toBeGreaterThan(0);
    for (const point of sum.body) {
      expect(point).toEqual({ t: expect.any(String), y: expect.anything() });
    }
    expect(total(sum.body)).toBe(SEATS_TOTAL);

    expect(avg.status).toBe(200);
    expect(total(avg.body) / avg.body.length).toBeCloseTo(6, 5);

    expect(count.status).toBe(200);
    expect(total(count.body)).toBe(3);

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(badMetric.status).toBe(400);
    expect(missingProperty.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/session-data/numeric-stats summarises a numeric property', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const params = dateRange(seed, { propertyName: 'seats' });
    const response = await admin.get(`${base}/session-data/numeric-stats`, { params });
    const shared = await (await share()).get(`${base}/session-data/numeric-stats`, { params });
    const denied = await viewer.get(`${base}/session-data/numeric-stats`, { params });
    const missingProperty = await admin.get(`${base}/session-data/numeric-stats`, {
      params: dateRange(seed),
    });

    expect(response.status).toBe(200);
    expect(Object.keys(response.body).sort()).toEqual(['average', 'max', 'median', 'min', 'total']);
    expect(Number(response.body.min)).toBe(5);
    expect(Number(response.body.max)).toBe(7);
    expect(Number(response.body.average)).toBeCloseTo(6, 5);
    expect(Number(response.body.median)).toBeCloseTo(6, 5);
    expect(Number(response.body.total)).toBe(SEATS_TOTAL);

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingProperty.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/session-data/property-series counts property values over time', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const params = dateRange(seed, { propertyName: 'plan', unit: 'day', timezone: TIMEZONE });
    const response = await admin.get(`${base}/session-data/property-series`, { params });
    const shared = await (await share()).get(`${base}/session-data/property-series`, { params });
    const denied = await viewer.get(`${base}/session-data/property-series`, { params });
    const missingProperty = await admin.get(`${base}/session-data/property-series`, {
      params: dateRange(seed),
    });

    expect(response.status).toBe(200);
    for (const point of response.body) {
      expect(point).toEqual({
        x: expect.any(String),
        t: expect.any(String),
        y: expect.any(Number),
      });
    }
    const pro = response.body
      .filter((point: any) => point.x === 'pro')
      .reduce((sum: number, point: any) => sum + point.y, 0);
    expect(pro).toBe(3);

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingProperty.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/session-data/stats aggregates activity per property value', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const params = dateRange(seed, { propertyName: 'plan' });
    const response = await admin.get(`${base}/session-data/stats`, { params });
    const shared = await (await share()).get(`${base}/session-data/stats`, { params });
    const denied = await viewer.get(`${base}/session-data/stats`, { params });
    const missingProperty = await admin.get(`${base}/session-data/stats`, {
      params: dateRange(seed),
    });

    expect(response.status).toBe(200);
    for (const row of response.body) {
      expect(Object.keys(row).sort()).toEqual([
        'activity',
        'events',
        'label',
        'sessions',
        'views',
        'visits',
      ]);
    }
    const pro = response.body.find((row: any) => row.label === 'pro');
    expect(pro).toBeDefined();
    expect(Number(pro.sessions)).toBe(3);
    expect(Number(pro.views)).toBeGreaterThan(0);

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingProperty.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/session-data/properties lists session properties', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.get(`${base}/session-data/properties`, {
      params: dateRange(seed),
    });
    const single = await admin.get(`${base}/session-data/properties`, {
      params: dateRange(seed, { propertyName: 'seats' }),
    });
    const shared = await (await share()).get(`${base}/session-data/properties`, {
      params: dateRange(seed),
    });
    const denied = await viewer.get(`${base}/session-data/properties`, {
      params: dateRange(seed),
    });
    const missingRange = await admin.get(`${base}/session-data/properties`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        { propertyName: 'seats', dataType: 2, total: 3 },
        { propertyName: 'active', dataType: 3, total: 3 },
        { propertyName: 'signedUpAt', dataType: 4, total: 3 },
        { propertyName: 'tags', dataType: 5, total: 3 },
        expect.objectContaining({ propertyName: 'plan', dataType: 1 }),
      ]),
    );

    // `propertyName` scopes to sessions that carry that property, then lists every
    // property of those sessions (co-occurrence), so `plan` is limited to the 3 seeded ones.
    expect(single.status).toBe(200);
    expect(single.body).toHaveLength(5);
    expect(single.body).toEqual(
      expect.arrayContaining([
        { propertyName: 'seats', dataType: 2, total: 3 },
        { propertyName: 'plan', dataType: 1, total: 3 },
      ]),
    );

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingRange.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/session-data/values returns value counts for a property', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const plan = await admin.get(`${base}/session-data/values`, {
      params: dateRange(seed, { propertyName: 'plan' }),
    });
    const seats = await admin.get(`${base}/session-data/values`, {
      params: dateRange(seed, { propertyName: 'seats', dataType: 2 }),
    });
    const shared = await (await share()).get(`${base}/session-data/values`, {
      params: dateRange(seed, { propertyName: 'plan' }),
    });
    const denied = await viewer.get(`${base}/session-data/values`, {
      params: dateRange(seed, { propertyName: 'plan' }),
    });
    const missingRange = await admin.get(`${base}/session-data/values`, {
      params: { propertyName: 'plan' },
    });

    expect(plan.status).toBe(200);
    for (const row of plan.body) {
      expect(row).toEqual({ value: expect.any(String), total: expect.any(Number) });
    }
    expect(plan.body.map((row: any) => row.value)).toContain('pro');

    expect(seats.status).toBe(200);
    expect(seats.body.map((row: any) => Number(row.value)).sort()).toEqual(SEATS);

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingRange.status).toBe(400);
  });
});
