import { expect, test } from './fixtures';
import { EVENT_TYPE, UNKNOWN_UUID } from './helpers/constants';
import { dateRange, TIMEZONE } from './helpers/dates';
import { createWebsite, deleteWebsite } from './helpers/entities';
import { PERSONAS } from './seed/dataset';

const sessionShape = {
  id: expect.any(String),
  websiteId: expect.any(String),
  firstAt: expect.any(String),
  lastAt: expect.any(String),
  createdAt: expect.any(String),
  visits: expect.anything(),
  views: expect.anything(),
  events: expect.anything(),
};

test.describe('Sessions', () => {
  test.describe.configure({ mode: 'serial' });

  /** A seeded session that carries a distinct id (identified persona). */
  let identifiedSessionId = '';

  test('GET /api/websites/{websiteId}/sessions lists sessions with paging', async ({
    admin,
    share,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/sessions`;
    const response = await admin.get(path, { params: dateRange(seed, { pageSize: 5 }) });
    const second = await admin.get(path, { params: dateRange(seed, { pageSize: 5, page: 2 }) });
    const shared = await (await share()).get(path, { params: dateRange(seed) });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: expect.any(Array),
      count: expect.any(Number),
      page: 1,
      pageSize: 5,
    });
    expect(response.body.data).toHaveLength(5);
    expect(response.body.count).toBeGreaterThan(5);
    expect(response.body.data[0]).toMatchObject({ ...sessionShape, websiteId: seed.website.id });
    // `distinctId` is omitted from rows for anonymous sessions.
    for (const key of ['browser', 'os', 'device', 'screen', 'language', 'country']) {
      expect(response.body.data[0]).toHaveProperty(key);
    }
    expect(response.body.data.map((s: any) => s.id)).not.toContain(second.body.data[0].id);
    expect(shared.status).toBe(200);
  });

  test('GET /api/websites/{websiteId}/sessions filters by distinctId and search', async ({
    admin,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/sessions`;
    const [distinctId] = seed.data.distinctIds;
    const unfiltered = await admin.get(path, { params: dateRange(seed) });
    const filtered = await admin.get(path, { params: dateRange(seed, { distinctId }) });
    const searched = await admin.get(path, { params: dateRange(seed, { search: distinctId }) });
    const none = await admin.get(path, {
      params: dateRange(seed, { distinctId: 'zzz-no-such-user' }),
    });

    expect(filtered.status).toBe(200);
    expect(filtered.body.data.length).toBeGreaterThan(0);
    expect(filtered.body.count).toBeLessThan(unfiltered.body.count);
    expect(filtered.body.data[0]).toMatchObject({ ...sessionShape, websiteId: seed.website.id });
    expect(searched.status).toBe(200);
    expect(searched.body.data.length).toBeGreaterThan(0);
    expect(none.body.data).toHaveLength(0);
    expect(none.body.count).toBe(0);

    // Only the session that received the `identify` call carries session data.
    for (const session of filtered.body.data) {
      const properties = await admin.get(`${path}/${session.id}/properties`);

      if (properties.body?.length) {
        identifiedSessionId = session.id;
        break;
      }
    }

    expect(identifiedSessionId).not.toBe('');
  });

  test('GET /api/websites/{websiteId}/sessions validates params and permissions', async ({
    admin,
    api,
    viewer,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/sessions`;
    const missingRange = await admin.get(path);
    const anonymous = await api.get(path, { params: dateRange(seed) });
    const denied = await viewer.get(path, { params: dateRange(seed) });
    const unknown = await viewer.get(`/api/websites/${UNKNOWN_UUID}/sessions`, {
      params: dateRange(seed),
    });

    expect(missingRange.status).toBe(400);
    expect(anonymous.status).toBe(401);
    expect(denied.status).toBe(401);
    expect(unknown.status).toBe(401);
  });

  test('GET /api/websites/{websiteId}/sessions/{sessionId} returns a session', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/sessions/${seed.data.sessionId}`;
    const response = await admin.get(path);
    const identified = await admin.get(
      `/api/websites/${seed.website.id}/sessions/${identifiedSessionId}`,
    );
    const shared = await (await share()).get(path);
    const denied = await viewer.get(path);
    const unknown = await admin.get(`/api/websites/${seed.website.id}/sessions/${UNKNOWN_UUID}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: seed.data.sessionId,
      websiteId: seed.website.id,
      canDelete: seed.db === 'postgres',
      stitchedSessionCount: expect.any(Number),
    });
    expect(response.body.stitchedSessionCount).toBeGreaterThanOrEqual(1);

    expect(identified.status).toBe(200);
    expect(identified.body.distinctId).toBe(seed.data.distinctIds[0]);
    expect(identified.body.stitchedSessionCount).toBeGreaterThanOrEqual(1);

    expect(shared.status).toBe(200);
    expect(shared.body.id).toBe(seed.data.sessionId);
    expect(shared.body.canDelete).toBe(false);
    expect(denied.status).toBe(401);
    expect(unknown.status).toBe(404);
  });

  test('GET /api/websites/{websiteId}/sessions/{sessionId}/activity returns the event log', async ({
    admin,
    viewer,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/sessions/${seed.data.sessionId}/activity`;
    const response = await admin.get(path, { params: dateRange(seed) });
    const stitched = await admin.get(
      `/api/websites/${seed.website.id}/sessions/${identifiedSessionId}/activity`,
      { params: dateRange(seed, { distinctId: seed.data.distinctIds[0] }) },
    );
    const missingRange = await admin.get(path);
    const invalid = await admin.get(path, { params: { startAt: 'abc', endAt: 'def' } });
    const denied = await viewer.get(path, { params: dateRange(seed) });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toMatchObject({
      eventId: expect.any(String),
      visitId: expect.any(String),
      createdAt: expect.any(String),
      urlPath: expect.any(String),
      eventType: expect.any(Number),
    });
    expect(response.body[0]).toHaveProperty('eventName');
    expect(response.body[0]).toHaveProperty('hasData');
    expect(response.body.some((row: any) => row.eventType === EVENT_TYPE.pageView)).toBe(true);

    expect(stitched.status).toBe(200);
    expect(stitched.body.length).toBeGreaterThan(0);
    expect(missingRange.status).toBe(400);
    expect(invalid.status).toBe(400);
    expect(denied.status).toBe(401);
  });

  test('GET /api/websites/{websiteId}/sessions/{sessionId}/properties returns session data', async ({
    admin,
    viewer,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/sessions/${identifiedSessionId}/properties`;
    const response = await admin.get(path);
    const unknown = await admin.get(
      `/api/websites/${seed.website.id}/sessions/${UNKNOWN_UUID}/properties`,
    );
    const denied = await viewer.get(path);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toMatchObject({
      sessionId: identifiedSessionId,
      dataKey: expect.any(String),
      dataType: expect.any(Number),
    });
    for (const key of ['stringValue', 'numberValue', 'dateValue']) {
      expect(response.body[0]).toHaveProperty(key);
    }
    expect(unknown.status).toBe(200);
    expect(unknown.body).toEqual([]);
    expect(denied.status).toBe(401);
  });

  test('GET /api/websites/{websiteId}/sessions/stats returns session totals', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/sessions/stats`;
    const response = await admin.get(path, { params: dateRange(seed) });
    const missingRange = await admin.get(path);
    const shared = await (await share()).get(path, { params: dateRange(seed) });
    const denied = await viewer.get(path, { params: dateRange(seed) });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      pageviews: { value: expect.anything() },
      visitors: { value: expect.anything() },
      visits: { value: expect.anything() },
      countries: { value: expect.anything() },
      events: { value: expect.anything() },
    });
    expect(Number(response.body.pageviews.value)).toBeGreaterThanOrEqual(
      seed.data.expectedPageviews,
    );
    expect(Number(response.body.visitors.value)).toBeGreaterThan(0);
    expect(Number(response.body.events.value)).toBeGreaterThan(0);
    expect(missingRange.status).toBe(400);
    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
  });

  test('GET /api/websites/{websiteId}/sessions/weekly returns a 7x24 grid', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const path = `/api/websites/${seed.website.id}/sessions/weekly`;
    const params = dateRange(seed, { timezone: TIMEZONE });
    const response = await admin.get(path, { params });
    const missingTimezone = await admin.get(path, { params: dateRange(seed) });
    const shared = await (await share()).get(path, { params });
    const denied = await viewer.get(path, { params });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(7);
    for (const day of response.body) {
      expect(day).toHaveLength(24);
      for (const hour of day) {
        expect(typeof hour).toBe('number');
      }
    }
    const total = response.body.flat().reduce((sum: number, n: number) => sum + n, 0);
    expect(total).toBeGreaterThan(0);
    expect(missingTimezone.status).toBe(400);
    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
  });

  test.describe('DELETE /api/websites/{websiteId}/sessions/{sessionId}', () => {
    let websiteId = '';
    let sessionId = '';

    test.beforeAll(async ({ admin, api, seed }) => {
      test.skip(seed.db === 'clickhouse', 'Session deletion requires relational storage');

      websiteId = (await createWebsite(admin)).id;

      const sent = await api.post('/api/send', {
        type: 'event',
        payload: {
          website: websiteId,
          hostname: 'x.test',
          url: '/',
          ip: '10.0.9.9',
          userAgent: PERSONAS[0].userAgent,
        },
      });

      expect(sent.status).toBe(200);

      await expect
        .poll(
          async () => {
            const sessions = await admin.get(`/api/websites/${websiteId}/sessions`, {
              params: { startAt: Date.now() - 60 * 60 * 1000, endAt: Date.now() },
            });
            sessionId = sessions.body?.data?.[0]?.id ?? '';
            return sessionId;
          },
          { timeout: 15_000 },
        )
        .not.toBe('');
    });

    test.afterAll(async ({ admin }) => {
      if (websiteId) {
        await deleteWebsite(admin, websiteId);
      }
    });

    test('DELETE /api/websites/{websiteId}/sessions/{sessionId} deletes a session', async ({
      admin,
      api,
      user,
      seed,
    }) => {
      const path = `/api/websites/${websiteId}/sessions/${sessionId}`;
      const anonymous = await api.del(path);
      const denied = await user.del(path);
      const before = await admin.get(path);
      const response = await admin.del(path);
      const after = await admin.get(path);
      const unknown = await admin.del(`/api/websites/${websiteId}/sessions/${UNKNOWN_UUID}`);
      const list = await admin.get(`/api/websites/${websiteId}/sessions`, {
        params: dateRange(seed),
      });

      expect(anonymous.status).toBe(401);
      expect(denied.status).toBe(401);
      expect(before.status).toBe(200);
      expect(before.body.canDelete).toBe(true);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
      expect(after.status).toBe(404);
      expect(unknown.status).toBe(404);
      expect(list.body.data).toHaveLength(0);
    });
  });
});
