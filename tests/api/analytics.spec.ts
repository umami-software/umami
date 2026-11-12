import { expect, test } from './fixtures';
import { EVENT_TYPE, UNKNOWN_UUID } from './helpers/constants';
import { dateRange, TIMEZONE } from './helpers/dates';

const point = { x: expect.any(String), y: expect.any(Number) };

test.describe('Analytics', () => {
  test.describe.configure({ mode: 'serial' });

  test('GET /api/websites/{websiteId}/stats returns totals for the range', async ({
    admin,
    share,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/stats`;
    const response = await admin.get(path, { params: dateRange(seed) });
    const shared = await (await share()).get(path, { params: dateRange(seed) });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      pageviews: expect.anything(),
      visitors: expect.anything(),
      visits: expect.anything(),
      bounces: expect.anything(),
      totaltime: expect.anything(),
      comparison: expect.any(Object),
    });
    // Other specs may send extra pageviews to the seeded website.
    expect(Number(response.body.pageviews)).toBeGreaterThanOrEqual(seed.data.expectedPageviews);
    expect(Number(response.body.visitors)).toBeGreaterThan(0);
    expect(Number(response.body.visits)).toBeGreaterThan(0);
    expect(shared.status).toBe(200);
  });

  test('GET /api/websites/{websiteId}/stats applies filters', async ({ admin, seed }) => {
    const path = `/api/websites/${seed.website.id}/stats`;
    const all = await admin.get(path, { params: dateRange(seed) });
    const filtered = await admin.get(path, {
      params: dateRange(seed, { path: '/pricing' }),
    });
    const none = await admin.get(path, {
      params: dateRange(seed, { path: '/zzz-no-such-page' }),
    });

    expect(filtered.status).toBe(200);
    expect(Number(filtered.body.pageviews)).toBeGreaterThan(0);
    expect(Number(filtered.body.pageviews)).toBeLessThan(Number(all.body.pageviews));
    expect(Number(none.body.pageviews)).toBe(0);
  });

  test('GET /api/websites/{websiteId}/stats validates params and permissions', async ({
    admin,
    api,
    viewer,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/stats`;
    const missingRange = await admin.get(path);
    const anonymous = await api.get(path, { params: dateRange(seed) });
    const denied = await viewer.get(path, { params: dateRange(seed) });
    const unknown = await viewer.get(`/api/websites/${UNKNOWN_UUID}/stats`, {
      params: dateRange(seed),
    });

    expect(missingRange.status).toBe(400);
    expect(anonymous.status).toBe(401);
    expect(denied.status).toBe(401);
    expect(unknown.status).toBe(401);
  });

  test('GET /api/websites/{websiteId}/pageviews returns pageview and session series', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/pageviews`;
    const params = dateRange(seed, { unit: 'day', timezone: TIMEZONE });
    const response = await admin.get(path, { params });
    const shared = await (await share()).get(path, { params });
    const denied = await viewer.get(path, { params });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      pageviews: expect.any(Array),
      sessions: expect.any(Array),
    });
    expect(response.body.pageviews.length).toBeGreaterThan(0);
    expect(response.body.pageviews[0]).toMatchObject(point);
    expect(response.body.sessions[0]).toMatchObject(point);

    const total = response.body.pageviews.reduce((sum: number, p: any) => sum + p.y, 0);
    expect(total).toBeGreaterThanOrEqual(seed.data.expectedPageviews);
    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
  });

  test('GET /api/websites/{websiteId}/pageviews supports compare and validates unit', async ({
    admin,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/pageviews`;
    const compare = await admin.get(path, {
      params: dateRange(seed, { unit: 'day', timezone: TIMEZONE, compare: 'prev' }),
    });
    const invalidUnit = await admin.get(path, {
      params: dateRange(seed, { unit: 'fortnight', timezone: TIMEZONE }),
    });

    expect(compare.status).toBe(200);
    expect(compare.body.compare).toEqual({
      pageviews: expect.any(Array),
      sessions: expect.any(Array),
      startDate: expect.any(String),
      endDate: expect.any(String),
    });
    expect(invalidUnit.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/metrics returns session, pageview and event metrics', async ({
    admin,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/metrics`;
    const browser = await admin.get(path, { params: dateRange(seed, { type: 'browser' }) });
    const url = await admin.get(path, { params: dateRange(seed, { type: 'path' }) });
    const event = await admin.get(path, { params: dateRange(seed, { type: 'event' }) });
    const channel = await admin.get(path, { params: dateRange(seed, { type: 'channel' }) });
    const stats = await admin.get(`/api/websites/${seed.website.id}/stats`, {
      params: dateRange(seed),
    });

    expect(browser.status).toBe(200);
    expect(browser.body.length).toBeGreaterThan(0);
    expect(browser.body[0]).toEqual(point);

    expect(url.status).toBe(200);
    const paths = url.body.map((row: any) => row.x);
    for (const page of seed.data.pages) {
      expect(paths).toContain(page);
    }
    // `y` is the number of distinct sessions per path, so it never exceeds pageviews.
    const total = url.body.reduce((sum: number, row: any) => sum + row.y, 0);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThanOrEqual(Number(stats.body.pageviews));

    expect(event.status).toBe(200);
    const events = event.body.map((row: any) => row.x);
    for (const name of seed.data.eventNames) {
      expect(events).toContain(name);
    }

    expect(channel.status).toBe(200);
    expect(Array.isArray(channel.body)).toBe(true);
  });

  test('GET /api/websites/{websiteId}/metrics supports search, limit and offset', async ({
    admin,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/metrics`;
    const search = await admin.get(path, {
      params: dateRange(seed, { type: 'path', search: 'pric' }),
    });
    const limited = await admin.get(path, {
      params: dateRange(seed, { type: 'path', limit: 2 }),
    });
    const offset = await admin.get(path, {
      params: dateRange(seed, { type: 'path', limit: 2, offset: 2 }),
    });

    expect(search.status).toBe(200);
    expect(search.body.length).toBeGreaterThan(0);
    for (const row of search.body) {
      expect(row.x).toContain('pric');
    }
    expect(limited.body).toHaveLength(2);
    expect(offset.body).toHaveLength(2);
    expect(offset.body[0].x).not.toBe(limited.body[0].x);
  });

  test('GET /api/websites/{websiteId}/metrics validates type and permissions', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/metrics`;
    const missingType = await admin.get(path, { params: dateRange(seed) });
    const invalidType = await admin.get(path, { params: dateRange(seed, { type: 'bogus' }) });
    const shared = await (await share()).get(path, { params: dateRange(seed, { type: 'os' }) });
    const denied = await viewer.get(path, { params: dateRange(seed, { type: 'os' }) });

    expect(missingType.status).toBe(400);
    expect(invalidType.status).toBe(400);
    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
  });

  test('GET /api/websites/{websiteId}/metrics/expanded returns rows with breakdown totals', async ({
    admin,
    viewer,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/metrics/expanded`;
    const response = await admin.get(path, { params: dateRange(seed, { type: 'path' }) });
    const invalid = await admin.get(path, { params: dateRange(seed, { type: 'bogus' }) });
    const denied = await viewer.get(path, { params: dateRange(seed, { type: 'path' }) });

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    // Expanded rows label the dimension `name` rather than `x`.
    expect(response.body[0]).toMatchObject({
      name: expect.any(String),
      visitors: expect.anything(),
      visits: expect.anything(),
      pageviews: expect.anything(),
      bounces: expect.anything(),
      totaltime: expect.anything(),
    });
    expect(response.body.map((row: any) => row.name)).toContain('/');
    const pageviews = response.body.reduce(
      (sum: number, row: any) => sum + Number(row.pageviews),
      0,
    );
    expect(pageviews).toBeGreaterThanOrEqual(seed.data.expectedPageviews);
    expect(invalid.status).toBe(400);
    expect(denied.status).toBe(401);
  });

  test('GET /api/websites/{websiteId}/values returns distinct values for a field', async ({
    admin,
    viewer,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/values`;
    const paths = await admin.get(path, { params: dateRange(seed, { type: 'path' }) });
    const events = await admin.get(path, { params: dateRange(seed, { type: 'event' }) });
    const distinct = await admin.get(path, {
      params: dateRange(seed, { type: 'distinctId' }),
    });
    const searched = await admin.get(path, {
      params: dateRange(seed, { type: 'path', search: 'docs' }),
    });
    const denied = await viewer.get(path, { params: dateRange(seed, { type: 'path' }) });

    expect(paths.status).toBe(200);
    expect(paths.body[0]).toEqual({ value: expect.any(String), count: expect.anything() });
    const values = paths.body.map((row: any) => row.value);
    for (const page of seed.data.pages) {
      expect(values).toContain(page);
    }

    expect(events.status).toBe(200);
    const names = events.body.map((row: any) => row.value);
    for (const name of seed.data.eventNames) {
      expect(names).toContain(name);
    }

    expect(distinct.status).toBe(200);
    const ids = distinct.body.map((row: any) => row.value);
    for (const id of seed.data.distinctIds) {
      expect(ids).toContain(id);
    }

    expect(searched.status).toBe(200);
    expect(searched.body.map((row: any) => row.value)).toContain('/docs');
    expect(denied.status).toBe(401);
  });

  test('GET /api/websites/{websiteId}/values rejects unsupported types', async ({
    admin,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/values`;
    const missing = await admin.get(path, { params: dateRange(seed) });
    const fullPath = await admin.get(path, { params: dateRange(seed, { type: 'fullPath' }) });
    const channel = await admin.get(path, { params: dateRange(seed, { type: 'channel' }) });

    expect(missing.status).toBe(400);
    expect(fullPath.status).toBe(400);
    expect(channel.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/active returns the active visitor count', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/active`;
    const response = await admin.get(path);
    const shared = await (await share()).get(path);
    const denied = await viewer.get(path);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ visitors: expect.any(Number) });
    expect(response.body.visitors).toBeGreaterThanOrEqual(0);
    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
  });

  test('GET /api/websites/{websiteId}/events lists events with paging', async ({ admin, seed }) => {
    const path = `/api/websites/${seed.website.id}/events`;
    const response = await admin.get(path, { params: dateRange(seed, { pageSize: 5 }) });
    const second = await admin.get(path, {
      params: dateRange(seed, { pageSize: 5, page: 2 }),
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: expect.any(Array),
      count: expect.any(Number),
      page: 1,
      pageSize: 5,
    });
    expect(response.body.data).toHaveLength(5);
    expect(response.body.count).toBeGreaterThanOrEqual(seed.data.expectedPageviews);
    expect(response.body.data[0]).toMatchObject({
      id: expect.any(String),
      sessionId: expect.any(String),
      createdAt: expect.any(String),
      urlPath: expect.any(String),
      eventType: expect.any(Number),
    });
    expect(response.body.data[0]).toHaveProperty('eventName');
    expect(response.body.data[0]).toHaveProperty('hasData');

    expect(second.status).toBe(200);
    expect(second.body.page).toBe(2);
    expect(second.body.data[0].id).not.toBe(response.body.data[0].id);
  });

  test('GET /api/websites/{websiteId}/events filters custom events and validates', async ({
    admin,
    api,
    viewer,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/events`;
    const custom = await admin.get(path, {
      params: dateRange(seed, { eventType: EVENT_TYPE.customEvent, pageSize: 100 }),
    });
    const search = await admin.get(path, {
      params: dateRange(seed, { eventType: EVENT_TYPE.customEvent, search: 'purchase' }),
    });
    const missingRange = await admin.get(path);
    const anonymous = await api.get(path, { params: dateRange(seed) });
    const denied = await viewer.get(path, { params: dateRange(seed) });

    expect(custom.status).toBe(200);
    expect(custom.body.data.length).toBeGreaterThan(0);
    for (const row of custom.body.data) {
      expect(row.eventType).toBe(EVENT_TYPE.customEvent);
      expect(row.eventName).toEqual(expect.any(String));
    }

    // Other specs send their own custom events, so only check the seeded names are present.
    const names = new Set(custom.body.data.map((row: any) => row.eventName));
    for (const name of seed.data.eventNames) {
      expect(names).toContain(name);
    }

    expect(search.status).toBe(200);
    expect(search.body.data.length).toBeGreaterThan(0);
    for (const row of search.body.data) {
      expect(row.eventName).toBe('purchase');
    }

    expect(missingRange.status).toBe(400);
    expect(anonymous.status).toBe(401);
    expect(denied.status).toBe(401);
  });

  test('GET /api/websites/{websiteId}/events/series returns per-event time series', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/events/series`;
    const params = dateRange(seed, { unit: 'day', timezone: TIMEZONE });
    const response = await admin.get(path, { params });
    const limited = await admin.get(path, { params: { ...params, limit: 1 } });
    const missingTimezone = await admin.get(path, { params: dateRange(seed, { unit: 'day' }) });
    const shared = await (await share()).get(path, { params });
    const denied = await viewer.get(path, { params });

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toEqual({
      x: expect.any(String),
      t: expect.any(String),
      y: expect.any(Number),
    });
    const names = new Set(response.body.map((row: any) => row.x));
    for (const name of seed.data.eventNames) {
      expect(names).toContain(name);
    }

    expect(limited.status).toBe(200);
    expect(new Set(limited.body.map((row: any) => row.x)).size).toBe(1);
    expect(missingTimezone.status).toBe(400);
    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
  });

  test('GET /api/websites/{websiteId}/events/stats returns event totals', async ({
    admin,
    viewer,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/events/stats`;
    const response = await admin.get(path, { params: dateRange(seed) });
    const missingRange = await admin.get(path);
    const denied = await viewer.get(path, { params: dateRange(seed) });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      events: expect.anything(),
      visitors: expect.anything(),
      visits: expect.anything(),
      uniqueEvents: expect.anything(),
      comparison: expect.any(Object),
    });
    expect(Number(response.body.data.events)).toBeGreaterThan(0);
    expect(Number(response.body.data.uniqueEvents)).toBeGreaterThanOrEqual(
      seed.data.eventNames.length,
    );
    expect(missingRange.status).toBe(400);
    expect(denied.status).toBe(401);
  });

  test('GET /api/realtime/{websiteId} returns realtime activity', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const path = `/api/realtime/${seed.website.id}`;
    const response = await admin.get(path);
    const withUnit = await admin.get(path, { params: { unit: 'minute', timezone: TIMEZONE } });
    const invalidUnit = await admin.get(path, { params: { unit: 'bogus' } });
    const shared = await (await share()).get(path);
    const denied = await viewer.get(path);

    expect(response.status).toBe(200);
    // countries/urls/referrers are `{ [key]: count }` maps; events is the raw event list.
    expect(response.body).toMatchObject({
      countries: expect.any(Object),
      urls: expect.any(Object),
      referrers: expect.any(Object),
      events: expect.any(Array),
      series: { views: expect.any(Array), visitors: expect.any(Array) },
      totals: {
        views: expect.any(Number),
        visitors: expect.any(Number),
        events: expect.any(Number),
        countries: expect.any(Number),
      },
      timestamp: expect.any(Number),
    });
    expect(Array.isArray(response.body.urls)).toBe(false);
    expect(withUnit.status).toBe(200);
    expect(invalidUnit.status).toBe(400);
    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
  });
});
