import { expect, test } from './fixtures';
import { createTeam, createWebsite, deleteTeam, deleteWebsite } from './helpers/entities';
import { PERSONAS } from './seed/dataset';

// All events sit in July 2026, so each visitor keeps one session (the session salt rotates monthly).
const at = (day: number, hour = 12) => Date.UTC(2026, 6, day, hour);

test.describe('Clear website data for a date range', () => {
  test.describe.configure({ mode: 'serial' });

  let websiteId = '';

  test.beforeAll(async ({ admin, api, seed }) => {
    test.skip(seed.db === 'clickhouse', 'Range delete requires relational storage');

    websiteId = (await createWebsite(admin)).id;

    // spanning: Jul 10 + Jul 11, all inside the range, deleted only by the second batch.
    // crossing: Jul 9 + Jul 10, crosses the range start, so it is kept.
    // outside: Jul 12 only, kept.
    const visits = [
      { ip: '10.0.20.1', persona: PERSONAS[0], times: [at(10), at(11)] },
      { ip: '10.0.20.2', persona: PERSONAS[1], times: [at(9), at(10)] },
      { ip: '10.0.20.3', persona: PERSONAS[0], times: [at(12)] },
    ];

    for (const { ip, persona, times } of visits) {
      for (const time of times) {
        const sent = await api.post('/api/send', {
          type: 'event',
          payload: {
            website: websiteId,
            hostname: 'x.test',
            url: '/',
            ip,
            userAgent: persona.userAgent,
            timestamp: Math.floor(time / 1000),
            // Every event on Jul 10 and 11 carries one event_data row.
            ...(time >= at(10, 0) && time < at(12, 0) ? { data: { plan: 'pro' } } : {}),
          },
        });

        expect(sent.status).toBe(200);
      }
    }
  });

  test.afterAll(async ({ admin }) => {
    if (websiteId) {
      await deleteWebsite(admin, websiteId);
    }
  });

  test('rejects anonymous, unauthorized and invalid requests', async ({ api, user, admin }) => {
    const path = `/api/websites/${websiteId}/clear`;
    const params = { startAt: at(10, 0), endAt: at(12, 0) };

    expect((await api.get(path, { params })).status).toBe(401);
    expect((await user.get(path, { params })).status).toBe(401);
    expect((await user.post(path, params)).status).toBe(401);
    expect(
      (await admin.get(path, { params: { startAt: params.endAt, endAt: params.startAt } })).status,
    ).toBe(400);
    // A null start must not be read as the epoch.
    expect((await admin.post(path, { startAt: null, endAt: params.endAt })).status).toBe(400);
  });

  test('team members follow the team website delete permission', async ({
    admin,
    user,
    viewer,
    seed,
  }) => {
    const team = await createTeam(admin);

    try {
      const addMember = (userId: string, role: string) =>
        admin.post(`/api/teams/${team.id}/users`, { userId, role });

      expect((await addMember(seed.user.id, 'team-manager')).status).toBe(200);
      expect((await addMember(seed.viewer.id, 'team-view-only')).status).toBe(200);

      const teamWebsite = await createWebsite(admin, { teamId: team.id });
      const path = `/api/websites/${teamWebsite.id}/clear`;
      const params = { startAt: at(10, 0), endAt: at(12, 0) };

      // Managers hold website:delete, view-only members hold nothing.
      expect((await user.get(path, { params })).status).toBe(200);
      expect((await viewer.get(path, { params })).status).toBe(401);
      expect((await viewer.post(path, params)).status).toBe(401);
    } finally {
      await deleteTeam(admin, team.id);
    }
  });

  test('preview counts match the batched delete, and data outside the range is kept', async ({
    admin,
  }) => {
    const path = `/api/websites/${websiteId}/clear`;
    const july10 = at(10, 0);
    const july11 = at(11, 0);
    const july12 = at(12, 0);

    const preview = await admin.get(path, { params: { startAt: july10, endAt: july12 } });
    expect(preview.status).toBe(200);
    expect(preview.body).toMatchObject({ events: 3, eventData: 3, sessions: 1 });

    const first = await admin.post(path, { startAt: july10, endAt: july11 });
    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({ events: 2, eventData: 2, sessions: 0 });

    const second = await admin.post(path, { startAt: july11, endAt: july12 });
    expect(second.status).toBe(200);
    expect(second.body).toMatchObject({ events: 1, eventData: 1, sessions: 1 });

    const remaining = await admin.get(path, {
      params: { startAt: Date.UTC(2026, 6, 1), endAt: Date.UTC(2026, 7, 1) },
    });
    expect(remaining.body).toMatchObject({ events: 2, eventData: 0, sessions: 2 });

    // A preview spanning several months sums one query per month to the same counts.
    const months = await admin.get(path, {
      params: { startAt: Date.UTC(2026, 5, 15), endAt: Date.UTC(2026, 8, 15) },
    });
    expect(months.body).toEqual(remaining.body);

    const again = await admin.get(path, { params: { startAt: july10, endAt: july12 } });
    expect(again.body).toEqual({
      events: 0,
      eventData: 0,
      sessions: 0,
      revenue: 0,
      replays: 0,
      heatmaps: 0,
    });
  });
});

test('returns 400 on ClickHouse storage', async ({ admin, seed }) => {
  test.skip(seed.db !== 'clickhouse', 'ClickHouse only');

  const response = await admin.get(`/api/websites/${seed.website.id}/clear`, {
    params: { startAt: Date.UTC(2026, 6, 1), endAt: Date.UTC(2026, 7, 1) },
  });

  expect(response.status).toBe(400);
});
