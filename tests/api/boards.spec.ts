import { expect, test } from './fixtures';
import { UNKNOWN_UUID } from './helpers/constants';
import { uniqueName } from './helpers/entities';

test.describe('Boards', () => {
  test.describe.configure({ mode: 'serial' });

  let boardId = '';
  let teamBoardId = '';
  let shareId = '';
  /** Every board created by this file; ids are pushed before any assertion so cleanup always runs. */
  const createdBoardIds: string[] = [];

  test.afterAll(async ({ admin }) => {
    for (const id of createdBoardIds) {
      await admin.del(`/api/boards/${id}`);
    }
  });

  test('POST /api/boards creates a board for the current user', async ({ admin, seed }) => {
    const name = uniqueName('board');
    const response = await admin.post('/api/boards', {
      type: 'website',
      name,
      description: 'created by the api suite',
      parameters: { websiteId: seed.website.id, rows: [] },
    });

    boardId = response.body?.id ?? '';
    createdBoardIds.push(boardId);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      type: 'website',
      name,
      description: 'created by the api suite',
      parameters: { websiteId: seed.website.id, rows: [] },
      userId: seed.admin.id,
      teamId: null,
      createdAt: expect.any(String),
    });
  });

  test('POST /api/boards creates a board for a team', async ({ admin, seed }) => {
    const response = await admin.post('/api/boards', {
      type: 'mixed',
      name: uniqueName('team-board'),
      description: '',
      teamId: seed.team.id,
      parameters: {},
    });

    teamBoardId = response.body?.id ?? '';
    createdBoardIds.push(teamBoardId);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ type: 'mixed', teamId: seed.team.id, userId: null });
  });

  test('POST /api/boards validates the body', async ({ admin, user, seed }) => {
    const dashboard = await admin.post('/api/boards', {
      type: 'dashboard',
      name: 'x',
      description: '',
    });
    const longName = await admin.post('/api/boards', {
      type: 'website',
      name: 'x'.repeat(101),
      description: '',
    });
    const missingName = await admin.post('/api/boards', { type: 'website', description: '' });
    const inaccessible = await user.post('/api/boards', {
      type: 'website',
      name: 'x',
      description: '',
      parameters: { websiteId: seed.website.id },
    });

    expect(dashboard.status).toBe(400);
    expect(longName.status).toBe(400);
    expect(missingName.status).toBe(400);
    expect(inaccessible.status).toBe(400);
    expect(inaccessible.body.error.message).toBe('Board contains inaccessible entities.');
  });

  test('POST /api/boards requires a user that can create boards', async ({
    api,
    viewer,
    user,
    seed,
  }) => {
    const body = { type: 'mixed', name: uniqueName('board'), description: '' };
    const anonymous = await api.post('/api/boards', body);
    const viewOnly = await viewer.post('/api/boards', body);
    const notMember = await viewer.post('/api/boards', { ...body, teamId: seed.team.id });
    // Team members hold website:create and can therefore create team boards.
    const member = await user.post('/api/boards', { ...body, teamId: seed.team.id });

    if (member.body?.id) {
      createdBoardIds.push(member.body.id);
    }

    expect(anonymous.status).toBe(401);
    expect(viewOnly.status).toBe(401);
    expect(notMember.status).toBe(401);
    expect(member.status).toBe(200);
    expect(member.body).toMatchObject({ teamId: seed.team.id, userId: null });
  });

  test('GET /api/boards lists the caller own boards', async ({ admin, user, seed }) => {
    const response = await admin.get('/api/boards');
    const search = await admin.get('/api/boards', {
      params: { search: 'zzz-no-such-board', orderBy: 'name', sortDescending: 'true' },
    });
    const invalidSort = await admin.get('/api/boards', { params: { sortDescending: 'yes' } });
    const other = await user.get('/api/boards');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ data: expect.any(Array), count: expect.any(Number) });
    expect(response.body.data.map((b: any) => b.id)).toContain(boardId);
    // Team boards and the personal dashboard are not part of the personal list.
    expect(response.body.data.map((b: any) => b.id)).not.toContain(teamBoardId);
    expect(response.body.data.map((b: any) => b.id)).not.toContain(seed.admin.id);
    expect(search.status).toBe(200);
    expect(search.body.data).toHaveLength(0);
    expect(invalidSort.status).toBe(400);
    expect(other.body.data.map((b: any) => b.id)).not.toContain(boardId);
  });

  test('GET /api/boards/{boardId} returns a board', async ({ admin, user, viewer, api, seed }) => {
    const response = await admin.get(`/api/boards/${boardId}`);
    const teamMember = await user.get(`/api/boards/${teamBoardId}`);
    const denied = await viewer.get(`/api/boards/${boardId}`);
    const anonymous = await api.get(`/api/boards/${boardId}`);
    const unknown = await user.get(`/api/boards/${UNKNOWN_UUID}`);
    const adminUnknown = await admin.get(`/api/boards/${UNKNOWN_UUID}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: boardId,
      type: 'website',
      parameters: { websiteId: seed.website.id },
    });
    expect(teamMember.status).toBe(200);
    expect(teamMember.body.id).toBe(teamBoardId);
    expect(denied.status).toBe(401);
    expect(anonymous.status).toBe(401);
    // Non-admins are refused before the lookup; admins bypass the check and get null.
    expect(unknown.status).toBe(401);
    expect(adminUnknown.status).toBe(200);
    expect(adminUnknown.body).toBeNull();
  });

  test('POST /api/boards/{boardId} updates a board', async ({ admin, user, viewer, seed }) => {
    const name = uniqueName('renamed');
    const response = await admin.post(`/api/boards/${boardId}`, {
      name,
      description: 'updated',
      parameters: { websiteId: seed.website.id, rows: [{ id: 'row-1', columns: [] }] },
    });
    const longName = await admin.post(`/api/boards/${boardId}`, { name: 'x'.repeat(201) });
    const denied = await viewer.post(`/api/boards/${boardId}`, { name });
    const member = await user.post(`/api/boards/${teamBoardId}`, { name });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: boardId,
      name,
      description: 'updated',
      parameters: { websiteId: seed.website.id, rows: [{ id: 'row-1', columns: [] }] },
    });
    expect(longName.status).toBe(400);
    expect(denied.status).toBe(401);
    // Team members hold website:update and can rename team boards.
    expect(member.status).toBe(200);
    expect(member.body).toMatchObject({ id: teamBoardId, name });
  });

  test('POST /api/boards/{boardId}/clone copies a board', async ({ admin, user, viewer, seed }) => {
    const name = uniqueName('clone');
    const response = await admin.post(`/api/boards/${boardId}/clone`, { name });
    const defaults = await admin.post(`/api/boards/${boardId}/clone`, {});
    const denied = await viewer.post(`/api/boards/${boardId}/clone`, { name });
    const unknown = await user.post(`/api/boards/${UNKNOWN_UUID}/clone`, { name });

    for (const clone of [response, defaults]) {
      if (clone.body?.id) {
        createdBoardIds.push(clone.body.id);
      }
    }

    expect(response.status).toBe(200);
    expect(response.body.id).not.toBe(boardId);
    expect(response.body).toMatchObject({
      type: 'website',
      name,
      userId: seed.admin.id,
      parameters: { websiteId: seed.website.id },
    });
    expect(defaults.status).toBe(200);
    expect(defaults.body.id).not.toBe(boardId);
    expect(defaults.body.name).toBe((await admin.get(`/api/boards/${boardId}`)).body.name);
    expect(denied.status).toBe(401);
    expect(unknown.status).toBe(401);
  });

  test('POST /api/boards/{boardId}/shares creates a share', async ({ admin, user, viewer }) => {
    const name = uniqueName('share');
    const response = await admin.post(`/api/boards/${boardId}/shares`, {
      name,
      parameters: { theme: 'dark' },
    });
    const missingName = await admin.post(`/api/boards/${boardId}/shares`, {});
    const denied = await viewer.post(`/api/boards/${boardId}/shares`, { name });
    const unknown = await user.post(`/api/boards/${UNKNOWN_UUID}/shares`, { name });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      entityId: boardId,
      name,
      shareType: 4,
      slug: expect.any(String),
      parameters: { theme: 'dark' },
    });
    expect(response.body.slug).toHaveLength(16);
    expect(missingName.status).toBe(400);
    expect(denied.status).toBe(401);
    expect(unknown.status).toBe(401);

    shareId = response.body.id;
  });

  test('GET /api/boards/{boardId}/shares lists the board shares', async ({ admin, viewer }) => {
    const response = await admin.get(`/api/boards/${boardId}/shares`);
    const paged = await admin.get(`/api/boards/${boardId}/shares`, {
      params: { page: 2, pageSize: 1 },
    });
    const denied = await viewer.get(`/api/boards/${boardId}/shares`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ data: expect.any(Array), count: expect.any(Number) });
    expect(response.body.data.map((s: any) => s.id)).toContain(shareId);
    expect(response.body.data[0]).toMatchObject({
      entityId: boardId,
      shareType: 4,
      slug: expect.any(String),
      createdAt: expect.any(String),
    });
    expect(paged.status).toBe(200);
    expect(paged.body).toMatchObject({ page: 2, pageSize: 1, count: 1, data: [] });
    expect(denied.status).toBe(401);
  });

  test('DELETE /api/boards/{boardId} deletes a board', async ({ admin, user, viewer }) => {
    const denied = await viewer.del(`/api/boards/${boardId}`);
    const notOwner = await user.del(`/api/boards/${boardId}`);
    const response = await admin.del(`/api/boards/${boardId}`);
    const gone = await admin.get(`/api/boards/${boardId}`);
    // Team members hold website:delete and can delete team boards.
    const member = await user.del(`/api/boards/${teamBoardId}`);

    expect(denied.status).toBe(401);
    expect(notOwner.status).toBe(401);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(gone.status).toBe(200);
    expect(gone.body).toBeNull();
    expect(member.status).toBe(200);
  });
});

test.describe('Dashboard', () => {
  test.describe.configure({ mode: 'serial' });

  test('POST /api/dashboard creates or updates the caller dashboard', async ({
    user,
    api,
    seed,
  }) => {
    const name = uniqueName('dashboard');
    const response = await user.post('/api/dashboard', {
      name,
      description: 'api suite dashboard',
      parameters: { rows: [] },
    });
    const updated = await user.post('/api/dashboard', {
      name: `${name}-2`,
      description: 'api suite dashboard',
      parameters: { rows: [{ id: 'row-1', columns: [] }] },
    });
    const invalid = await user.post('/api/dashboard', { name: 'x'.repeat(201) });
    const anonymous = await api.post('/api/dashboard', { name, description: '' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: seed.user.id,
      type: 'dashboard',
      userId: seed.user.id,
      name,
      parameters: { rows: [] },
    });
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({
      id: seed.user.id,
      name: `${name}-2`,
      parameters: { rows: [{ id: 'row-1', columns: [] }] },
    });
    expect(invalid.status).toBe(400);
    expect(anonymous.status).toBe(401);
  });

  test('GET /api/dashboard returns the caller dashboard', async ({ user, api, seed }) => {
    const response = await user.get('/api/dashboard');
    const anonymous = await api.get('/api/dashboard');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: seed.user.id,
      type: 'dashboard',
      userId: seed.user.id,
      parameters: { rows: [{ id: 'row-1', columns: [] }] },
    });
    expect(anonymous.status).toBe(401);
  });
});
