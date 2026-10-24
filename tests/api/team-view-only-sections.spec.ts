import { expect, test } from './fixtures';
import { login } from './helpers/auth';
import { dateRange } from './helpers/dates';
import {
  assertStatus,
  createTeam,
  createUser,
  createWebsite,
  deleteTeam,
  deleteUser,
  deleteWebsite,
} from './helpers/entities';

test.describe('Sections a team limits its view-only members to', () => {
  test.describe.configure({ mode: 'serial' });

  let teamId = '';
  let websiteId = '';
  let viewerId = '';
  let viewerToken = '';
  let memberId = '';
  let memberToken = '';

  test.beforeAll(async ({ admin, api }) => {
    const viewer = await createUser(admin, { role: 'view-only' });
    const member = await createUser(admin, { role: 'user' });
    viewerId = viewer.id;
    memberId = member.id;
    viewerToken = await login(api, viewer);
    memberToken = await login(api, member);

    teamId = (await createTeam(admin)).id;

    for (const [userId, role] of [
      [viewerId, 'team-view-only'],
      [memberId, 'team-member'],
    ]) {
      assertStatus(
        await admin.post(`/api/teams/${teamId}/users`, { userId, role }),
        200,
        'add team member',
      );
    }

    websiteId = (await createWebsite(admin, { teamId })).id;
  });

  test.afterAll(async ({ admin }) => {
    if (websiteId) {
      await deleteWebsite(admin, websiteId);
    }

    if (teamId) {
      await deleteTeam(admin, teamId);
    }

    for (const id of [viewerId, memberId]) {
      if (id) {
        await deleteUser(admin, id);
      }
    }
  });

  const sections = (seed: any) => ({
    overview: [`/api/websites/${websiteId}/stats`, dateRange(seed)],
    events: [`/api/websites/${websiteId}/events`, dateRange(seed)],
    sessions: [`/api/websites/${websiteId}/sessions`, dateRange(seed)],
    revenue: [`/api/websites/${websiteId}/revenue/stats`, dateRange(seed, { currency: 'USD' })],
    replays: [`/api/websites/${websiteId}/replays`, dateRange(seed)],
    export: [`/api/websites/${websiteId}/export`, dateRange(seed)],
  });

  test('a view-only member sees every section until the team sets a limit', async ({
    api,
    seed,
  }) => {
    const viewer = api.bearer(viewerToken);

    for (const [name, [path, params]] of Object.entries(sections(seed))) {
      const response = await viewer.get(path as string, { params: params as any });

      expect(response.status, name).not.toBe(401);
    }
  });

  test('POST /api/teams/:teamId rejects a section name it does not know', async ({ admin }) => {
    const response = await admin.post(`/api/teams/${teamId}`, {
      viewOnlySections: ['events', 'replays'],
    });

    expect(response.status).toBe(400);
  });

  test('a view-only member cannot change the limit', async ({ api }) => {
    const response = await api
      .bearer(viewerToken)
      .post(`/api/teams/${teamId}`, { viewOnlySections: null });

    expect(response.status).toBe(401);
  });

  test('POST /api/teams/:teamId stores the limit', async ({ admin }) => {
    const response = await admin.post(`/api/teams/${teamId}`, {
      viewOnlySections: ['events'],
    });

    expect(response.status).toBe(200);
    expect(response.body.viewOnlySections).toEqual(['events']);
  });

  test('a limited view-only member sees overview and the chosen sections only', async ({
    api,
    seed,
  }) => {
    const viewer = api.bearer(viewerToken);
    const expected: Record<string, number> = {
      overview: 200,
      events: 200,
      sessions: 401,
      revenue: 401,
      replays: 401,
      export: 401,
    };

    for (const [name, [path, params]] of Object.entries(sections(seed))) {
      const response = await viewer.get(path as string, { params: params as any });

      expect(response.status, name).toBe(expected[name]);
    }
  });

  test('the limit does not apply to members above view-only', async ({ api, seed }) => {
    const member = api.bearer(memberToken);
    const [path, params] = sections(seed).sessions;
    const response = await member.get(path as string, { params: params as any });

    expect(response.status).toBe(200);
  });

  test('clearing the limit gives the view-only member everything again', async ({
    admin,
    api,
    seed,
  }) => {
    assertStatus(
      await admin.post(`/api/teams/${teamId}`, { viewOnlySections: null }),
      200,
      'clear limit',
    );

    const team = await admin.get(`/api/teams/${teamId}`);
    expect(team.body.viewOnlySections).toBeNull();

    const [path, params] = sections(seed).sessions;
    const response = await api.bearer(viewerToken).get(path as string, { params: params as any });

    expect(response.status).toBe(200);
  });
});
