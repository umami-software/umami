import { randomUUID } from 'node:crypto';
import { expect, test } from './fixtures';
import { ENTITY_TYPE, UNKNOWN_UUID } from './helpers/constants';
import { dateRange } from './helpers/dates';
import { deleteLink, uniqueName, uniqueSlug } from './helpers/entities';

test.describe('Links', () => {
  test.describe.configure({ mode: 'serial' });

  let linkId = '';
  let slug = '';
  let shareId = '';

  test.afterAll(async ({ admin }) => {
    if (shareId) {
      await admin.del(`/api/share/id/${shareId}`);
    }

    if (linkId) {
      await deleteLink(admin, linkId);
    }
  });

  test('POST /api/links creates a link for the current user', async ({ admin, seed }) => {
    const name = uniqueName('link');
    slug = uniqueSlug('link');
    const response = await admin.post('/api/links', { name, url: 'https://umami.is/', slug });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      name,
      url: 'https://umami.is/',
      slug,
      userId: seed.admin.id,
      teamId: null,
      createdAt: expect.any(String),
      deletedAt: null,
    });

    linkId = response.body.id;
  });

  test('POST /api/links accepts a fixed id and a team', async ({ admin, seed }) => {
    const id = randomUUID();
    const response = await admin.post('/api/links', {
      id,
      name: uniqueName('team-link'),
      url: 'https://umami.is/',
      slug: uniqueSlug('team'),
      teamId: seed.team.id,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id, teamId: seed.team.id, userId: null });

    await deleteLink(admin, id);
  });

  test('POST /api/links validates the body and requires permission', async ({
    admin,
    viewer,
    api,
  }) => {
    const shortSlug = await admin.post('/api/links', {
      name: 'x',
      url: 'https://umami.is/',
      slug: 'short',
    });
    const missingUrl = await admin.post('/api/links', { name: 'x', slug: uniqueSlug('link') });
    const denied = await viewer.post('/api/links', {
      name: 'x',
      url: 'https://umami.is/',
      slug: uniqueSlug('link'),
    });
    const anonymous = await api.post('/api/links', {
      name: 'x',
      url: 'https://umami.is/',
      slug: uniqueSlug('link'),
    });

    expect(shortSlug.status).toBe(400);
    expect(shortSlug.body.error.code).toBe('bad-request');
    expect(missingUrl.status).toBe(400);
    expect(denied.status).toBe(401);
    expect(anonymous.status).toBe(401);
  });

  test('GET /api/links lists the current user links', async ({ admin, user, viewer }) => {
    const response = await admin.get('/api/links');
    const search = await admin.get('/api/links', { params: { search: slug } });
    const sorted = await admin.get('/api/links', {
      params: { orderBy: 'createdAt', sortDescending: 'true', pageSize: 1 },
    });
    const invalidSort = await admin.get('/api/links', { params: { sortDescending: 'yes' } });
    const other = await user.get('/api/links');
    const none = await viewer.get('/api/links');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: expect.any(Array),
      count: expect.any(Number),
      page: 1,
      pageSize: expect.any(Number),
    });
    expect(response.body.data.map((l: any) => l.id)).toContain(linkId);
    expect(search.body.data.map((l: any) => l.id)).toEqual([linkId]);
    expect(sorted.status).toBe(200);
    expect(sorted.body.data).toHaveLength(1);
    expect(invalidSort.status).toBe(400);
    expect(other.body.data.map((l: any) => l.id)).not.toContain(linkId);
    expect(none.status).toBe(200);
    expect(none.body.data).toHaveLength(0);
  });

  test('GET /api/links/{linkId} returns a link', async ({ admin, user, viewer, api }) => {
    const response = await admin.get(`/api/links/${linkId}`);
    const denied = await viewer.get(`/api/links/${linkId}`);
    const anonymous = await api.get(`/api/links/${linkId}`);
    const unknown = await user.get(`/api/links/${UNKNOWN_UUID}`);
    // Admins bypass the ownership check, so an unknown id yields an empty 200.
    const adminUnknown = await admin.get(`/api/links/${UNKNOWN_UUID}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: linkId, slug });
    expect(denied.status).toBe(401);
    expect(anonymous.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(adminUnknown.status).toBe(200);
    expect(adminUnknown.body).toBeNull();
  });

  test('POST /api/links/{linkId} updates a link', async ({ admin, user, seed }) => {
    const name = uniqueName('renamed');
    slug = uniqueSlug('renamed');
    const response = await admin.post(`/api/links/${linkId}`, {
      name,
      slug,
      url: 'https://umami.is/docs',
    });
    const duplicate = await admin.post(`/api/links/${linkId}`, { slug: seed.link.slug });
    const denied = await user.post(`/api/links/${linkId}`, { name });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: linkId, name, slug, url: 'https://umami.is/docs' });
    expect(duplicate.status).toBe(400);
    expect(duplicate.body.error.message).toBe('That slug is already taken.');
    expect(denied.status).toBe(401);
  });

  test('POST /api/links/{linkId}/shares creates a link share', async ({ admin, user }) => {
    const name = uniqueName('link-share');
    const response = await admin.post(`/api/links/${linkId}/shares`, {
      name,
      parameters: { overview: true },
    });
    const invalid = await admin.post(`/api/links/${linkId}/shares`, {});
    const denied = await user.post(`/api/links/${linkId}/shares`, { name });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      entityId: linkId,
      shareType: ENTITY_TYPE.link,
      name,
      slug: expect.any(String),
      parameters: { overview: true },
    });
    expect(invalid.status).toBe(400);
    expect(denied.status).toBe(401);

    shareId = response.body.id;
  });

  test('GET /api/links/{linkId}/shares lists link shares', async ({ admin, viewer, api }) => {
    const response = await admin.get(`/api/links/${linkId}/shares`);
    const paged = await admin.get(`/api/links/${linkId}/shares`, {
      params: { page: 1, pageSize: 1 },
    });
    const denied = await viewer.get(`/api/links/${linkId}/shares`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ data: expect.any(Array), count: 1, page: 1 });
    expect(response.body.data[0]).toMatchObject({ id: shareId, entityId: linkId });
    expect(paged.body.pageSize).toBe(1);
    expect(denied.status).toBe(401);

    // The share resolves publicly to a link-typed token.
    const resolved = await api.get(`/api/share/${response.body.data[0].slug}`);

    expect(resolved.status).toBe(200);
    expect(resolved.body).toMatchObject({ shareType: ENTITY_TYPE.link, linkId, websiteId: linkId });
  });

  test('GET /api/links/charts returns chart data for accessible links', async ({
    admin,
    viewer,
    seed,
  }) => {
    const response = await admin.get('/api/links/charts', {
      params: { ids: `${seed.link.id},${linkId}`, ...dateRange(seed), timezone: 'UTC' },
    });
    const defaultRange = await admin.get('/api/links/charts', { params: { ids: seed.link.id } });
    const denied = await viewer.get('/api/links/charts', { params: { ids: seed.link.id } });
    const invalid = await admin.get('/api/links/charts', { params: { ids: 'nope' } });
    const missing = await admin.get('/api/links/charts');

    expect(response.status).toBe(200);
    // `data` is keyed by link id; ids the caller cannot view are silently dropped.
    expect(Object.keys(response.body.data)).toContain(seed.link.id);
    expect(response.body.data[seed.link.id]).toBeTruthy();
    expect(defaultRange.status).toBe(200);
    expect(denied.status).toBe(200);
    expect(denied.body.data).toEqual({});
    expect(invalid.status).toBe(400);
    expect(missing.status).toBe(400);
  });

  test('DELETE /api/links/{linkId} deletes a link', async ({ admin, user }) => {
    const denied = await user.del(`/api/links/${linkId}`);
    const response = await admin.del(`/api/links/${linkId}`);
    const gone = await admin.get(`/api/links/${linkId}`);

    expect(denied.status).toBe(401);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(gone.status).toBe(200);
    expect(gone.body).toBeNull();

    linkId = '';
  });
});
