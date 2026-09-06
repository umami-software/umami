import { expect, test } from './fixtures';
import { dateRange, TIMEZONE } from './helpers/dates';

/**
 * Seeded revenue on `seed.website` (see seed/dataset.ts): the 3 identified personas
 * each send a `purchase` on 3 days with revenue 49.5 / 59.5 / 69.5 in USD.
 * 9 purchases, sum 535.5, average 59.5. Nothing else in the suite ingests
 * `revenue` for this website, so these totals are asserted exactly.
 */

const PURCHASE_REVENUES = [49.5, 59.5, 69.5];
const PURCHASE_COUNT = 9;
const PURCHASE_TOTAL = PURCHASE_REVENUES.reduce((sum, value) => sum + value, 0) * 3;

test.describe('Revenue', () => {
  let base = '';

  test.beforeAll(({ seed }) => {
    base = `/api/websites/${seed.website.id}`;
  });

  test('GET /api/websites/{websiteId}/revenue/chart returns revenue per event over time', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const params = dateRange(seed, {
      currency: seed.data.currency,
      unit: 'day',
      timezone: TIMEZONE,
    });
    const response = await admin.get(`${base}/revenue/chart`, { params });
    const shared = await (await share()).get(`${base}/revenue/chart`, { params });
    const denied = await viewer.get(`${base}/revenue/chart`, { params });
    const missingCurrency = await admin.get(`${base}/revenue/chart`, {
      params: dateRange(seed),
    });
    const missingRange = await admin.get(`${base}/revenue/chart`, {
      params: { currency: seed.data.currency },
    });

    expect(response.status).toBe(200);
    expect(Object.keys(response.body)).toEqual(['chart']);
    // Purchases land on 3 distinct days, 3 per day.
    expect(response.body.chart).toHaveLength(3);
    for (const point of response.body.chart) {
      expect(point).toEqual({
        x: 'purchase',
        t: expect.any(String),
        y: expect.anything(),
        count: 3,
      });
      expect(Number(point.y)).toBeCloseTo(PURCHASE_TOTAL / 3, 5);
    }

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingCurrency.status).toBe(400);
    expect(missingRange.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/revenue/metrics breaks revenue down by a dimension', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const params = dateRange(seed, { currency: seed.data.currency });
    const byType: Record<string, any> = {};

    for (const type of ['country', 'region', 'referrer', 'channel']) {
      byType[type] = await admin.get(`${base}/revenue/metrics`, { params: { ...params, type } });
    }

    const shared = await (await share()).get(`${base}/revenue/metrics`, {
      params: { ...params, type: 'country' },
    });
    const denied = await viewer.get(`${base}/revenue/metrics`, {
      params: { ...params, type: 'country' },
    });
    const badType = await admin.get(`${base}/revenue/metrics`, {
      params: { ...params, type: 'browser' },
    });
    const missingType = await admin.get(`${base}/revenue/metrics`, { params });
    const missingCurrency = await admin.get(`${base}/revenue/metrics`, {
      params: dateRange(seed, { type: 'country' }),
    });

    for (const [type, response] of Object.entries(byType)) {
      expect(response.status, type).toBe(200);
      expect(Array.isArray(response.body), type).toBe(true);
      expect(response.body.length, type).toBeGreaterThan(0);
      for (const row of response.body) {
        // Region rows also carry the parent `country`.
        expect(Object.keys(row).sort(), type).toEqual(
          type === 'region' ? ['country', 'name', 'value'] : ['name', 'value'],
        );
      }
      // Every breakdown adds up to the full seeded revenue.
      const total = response.body.reduce((sum: number, row: any) => sum + Number(row.value), 0);
      expect(total, type).toBeCloseTo(PURCHASE_TOTAL, 5);
    }

    // The test image has no GeoIP database, so country/region are unresolved
    // (null on Postgres, '' on ClickHouse's non-nullable String columns).
    const unresolved = seed.db === 'clickhouse' ? '' : null;
    expect(byType.country.body).toEqual([{ name: unresolved, value: expect.anything() }]);
    expect(byType.region.body).toEqual([
      { country: unresolved, name: unresolved, value: expect.anything() },
    ]);

    // alice (google.com, utm+gclid => paidAds) buys 3 x 49.5, bob (t.co => organicSocial)
    // 3 x 59.5 and carol (no referrer, no query string => direct) 3 x 69.5.
    const asMap = (rows: any[]) =>
      Object.fromEntries(rows.map(row => [String(row.name), Number(row.value)]));
    expect(asMap(byType.referrer.body)).toEqual({
      'google.com': 148.5,
      't.co': 178.5,
      // No referrer is null on Postgres and '' on ClickHouse (see `unresolved` above).
      [String(unresolved)]: 208.5,
    });
    expect(asMap(byType.channel.body)).toEqual({
      paidAds: 148.5,
      organicSocial: 178.5,
      direct: 208.5,
    });

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(badType.status).toBe(400);
    expect(missingType.status).toBe(400);
    expect(missingCurrency.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/revenue/sessions lists sessions with revenue', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const params = dateRange(seed, { currency: seed.data.currency });
    const response = await admin.get(`${base}/revenue/sessions`, {
      params: { ...params, pageSize: 100 },
    });
    const paged = await admin.get(`${base}/revenue/sessions`, {
      params: { ...params, page: 2, pageSize: 2 },
    });
    const searched = await admin.get(`${base}/revenue/sessions`, {
      params: { ...params, search: 'zzz-no-such-session' },
    });
    const shared = await (await share()).get(`${base}/revenue/sessions`, { params });
    const denied = await viewer.get(`${base}/revenue/sessions`, { params });
    const missingCurrency = await admin.get(`${base}/revenue/sessions`, {
      params: dateRange(seed),
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: expect.any(Array),
      count: 3,
      page: 1,
      pageSize: 100,
    });
    expect(response.body.data).toHaveLength(3);
    for (const row of response.body.data) {
      expect(row).toMatchObject({
        id: expect.any(String),
        websiteId: seed.website.id,
        hostname: seed.data.hostname,
        browser: expect.any(String),
        os: expect.any(String),
        device: expect.any(String),
        firstAt: expect.any(String),
        lastAt: expect.any(String),
        createdAt: expect.any(String),
      });
    }

    expect(paged.status).toBe(200);
    expect(paged.body).toMatchObject({ count: 3, page: 2, pageSize: 2 });
    expect(paged.body.data).toHaveLength(1);

    expect(searched.status).toBe(200);
    expect(searched.body.data).toHaveLength(0);

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingCurrency.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/revenue/stats returns revenue totals', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const params = dateRange(seed, { currency: seed.data.currency });
    const response = await admin.get(`${base}/revenue/stats`, { params });
    const otherCurrency = await admin.get(`${base}/revenue/stats`, {
      params: { ...params, currency: 'EUR' },
    });
    const shared = await (await share()).get(`${base}/revenue/stats`, { params });
    const denied = await viewer.get(`${base}/revenue/stats`, { params });
    const missingCurrency = await admin.get(`${base}/revenue/stats`, { params: dateRange(seed) });
    const missingRange = await admin.get(`${base}/revenue/stats`, {
      params: { currency: seed.data.currency },
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      count: PURCHASE_COUNT,
      unique_count: 3,
      total_sessions: expect.any(Number),
    });
    // The comparison window precedes the seeded range and holds no revenue.
    expect(Object.keys(response.body.comparison).sort()).toEqual([
      'arpu',
      'average',
      'count',
      'sum',
      'total_sessions',
      'unique_count',
    ]);
    expect(response.body.comparison.count).toBe(0);
    expect(Number(response.body.comparison.sum ?? 0)).toBe(0);
    expect(Number(response.body.sum)).toBeCloseTo(PURCHASE_TOTAL, 5);
    expect(Number(response.body.average)).toBeCloseTo(PURCHASE_TOTAL / PURCHASE_COUNT, 5);
    expect(response.body.total_sessions).toBeGreaterThanOrEqual(3);
    expect(Number(response.body.arpu)).toBeCloseTo(
      PURCHASE_TOTAL / response.body.total_sessions,
      5,
    );

    // Nothing was ingested in EUR.
    expect(otherCurrency.status).toBe(200);
    expect(otherCurrency.body.count).toBe(0);
    expect(Number(otherCurrency.body.sum ?? 0)).toBe(0);

    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
    expect(missingCurrency.status).toBe(400);
    expect(missingRange.status).toBe(400);
  });
});
