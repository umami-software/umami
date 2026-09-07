import { randomUUID } from 'node:crypto';
import { expect, test } from './fixtures';
import { ENTITY_TYPE, UNKNOWN_UUID } from './helpers/constants';
import { dateRange } from './helpers/dates';
import { deletePixel, uniqueName, uniqueSlug } from './helpers/entities';

test.describe('Pixels', () => {
  test.describe.configure({ mode: 'serial' });

  let pixelId = '';
  let slug = '';
  let shareId = '';

  test.afterAll(async ({ admin }) => {
    if (shareId) {
      await admin.del(`/api/share/id/${shareId}`);
    }

    if (pixelId) {
      await deletePixel(admin, pixelId);
    }
  });

  test('POST /api/pixels creates a pixel for the current user', async ({ admin, seed }) => {
    const name = uniqueName('pixel');
    slug = uniqueSlug('pixel');
    const response = await admin.post('/api/pixels', { name, slug });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      name,
      slug,
      userId: seed.admin.id,
      teamId: null,
      createdAt: expect.any(String),
      deletedAt: null,
    });

    pixelId = response.body.id;
  });

  test('POST /api/pixels accepts a fixed id and a team', async ({ admin, seed }) => {
    const id = randomUUID();
    const response = await admin.post('/api/pixels', {
      id,
      name: uniqueName('team-pixel'),
      slug: uniqueSlug('team'),
      teamId: seed.team.id,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id, teamId: seed.team.id, userId: null });

    await deletePixel(admin, id);
  });

  test('POST /api/pixels validates the body and requires permission', async ({
    admin,
    viewer,
    api,
  }) => {
    const shortSlug = await admin.post('/api/pixels', { name: 'x', slug: 'short' });
    const missingName = await admin.post('/api/pixels', { slug: uniqueSlug('pixel') });
    const denied = await viewer.post('/api/pixels', { name: 'x', slug: uniqueSlug('pixel') });
    const anonymous = await api.post('/api/pixels', { name: 'x', slug: uniqueSlug('pixel') });

    expect(shortSlug.status).toBe(400);
    expect(shortSlug.body.error.code).toBe('bad-request');
    expect(missingName.status).toBe(400);
    expect(denied.status).toBe(401);
    expect(anonymous.status).toBe(401);
  });

  test('GET /api/pixels lists the current user pixels', async ({ admin, user, viewer }) => {
    const response = await admin.get('/api/pixels');
    const search = await admin.get('/api/pixels', { params: { search: slug } });
    const sorted = await admin.get('/api/pixels', {
      params: { orderBy: 'createdAt', sortDescending: 'true', pageSize: 1 },
    });
    const invalidSort = await admin.get('/api/pixels', { params: { sortDescending: 'yes' } });
    const other = await user.get('/api/pixels');
    const none = await viewer.get('/api/pixels');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: expect.any(Array),
      count: expect.any(Number),
      page: 1,
      pageSize: expect.any(Number),
    });
    expect(response.body.data.map((p: any) => p.id)).toContain(pixelId);
    expect(search.body.data.map((p: any) => p.id)).toEqual([pixelId]);
    expect(sorted.status).toBe(200);
    expect(sorted.body.data).toHaveLength(1);
    expect(invalidSort.status).toBe(400);
    expect(other.body.data.map((p: any) => p.id)).not.toContain(pixelId);
    expect(none.status).toBe(200);
    expect(none.body.data).toHaveLength(0);
  });

  test('GET /api/pixels/{pixelId} returns a pixel', async ({ admin, user, viewer, api }) => {
    const response = await admin.get(`/api/pixels/${pixelId}`);
    const denied = await viewer.get(`/api/pixels/${pixelId}`);
    const anonymous = await api.get(`/api/pixels/${pixelId}`);
    const unknown = await user.get(`/api/pixels/${UNKNOWN_UUID}`);
    // Admins bypass the ownership check, so an unknown id yields an empty 200.
    const adminUnknown = await admin.get(`/api/pixels/${UNKNOWN_UUID}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: pixelId, slug });
    expect(denied.status).toBe(401);
    expect(anonymous.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(adminUnknown.status).toBe(200);
    expect(adminUnknown.body).toBeNull();
  });

  test('POST /api/pixels/{pixelId} updates a pixel', async ({ admin, user, seed }) => {
    const name = uniqueName('renamed');
    slug = uniqueSlug('renamed');
    const response = await admin.post(`/api/pixels/${pixelId}`, { name, slug });
    const duplicate = await admin.post(`/api/pixels/${pixelId}`, { slug: seed.pixel.slug });
    const denied = await user.post(`/api/pixels/${pixelId}`, { name });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: pixelId, name, slug });
    expect(duplicate.status).toBe(400);
    expect(duplicate.body.error.message).toBe('That slug is already taken.');
    expect(denied.status).toBe(401);
  });

  test('POST /api/pixels/{pixelId}/shares creates a pixel share', async ({ admin, user }) => {
    const name = uniqueName('pixel-share');
    const response = await admin.post(`/api/pixels/${pixelId}/shares`, {
      name,
      parameters: { overview: true },
    });
    const invalid = await admin.post(`/api/pixels/${pixelId}/shares`, {});
    const denied = await user.post(`/api/pixels/${pixelId}/shares`, { name });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      entityId: pixelId,
      shareType: ENTITY_TYPE.pixel,
      name,
      slug: expect.any(String),
      parameters: { overview: true },
    });
    expect(invalid.status).toBe(400);
    expect(denied.status).toBe(401);

    shareId = response.body.id;
  });

  test('GET /api/pixels/{pixelId}/shares lists pixel shares', async ({ admin, viewer, api }) => {
    const response = await admin.get(`/api/pixels/${pixelId}/shares`);
    const paged = await admin.get(`/api/pixels/${pixelId}/shares`, {
      params: { page: 1, pageSize: 1 },
    });
    const denied = await viewer.get(`/api/pixels/${pixelId}/shares`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ data: expect.any(Array), count: 1, page: 1 });
    expect(response.body.data[0]).toMatchObject({ id: shareId, entityId: pixelId });
    expect(paged.body.pageSize).toBe(1);
    expect(denied.status).toBe(401);

    // The share resolves publicly to a pixel-typed token.
    const resolved = await api.get(`/api/share/${response.body.data[0].slug}`);

    expect(resolved.status).toBe(200);
    expect(resolved.body).toMatchObject({
      shareType: ENTITY_TYPE.pixel,
      pixelId,
      websiteId: pixelId,
    });
  });

  test('GET /api/pixels/charts returns chart data for accessible pixels', async ({
    admin,
    viewer,
    seed,
  }) => {
    const response = await admin.get('/api/pixels/charts', {
      params: { ids: `${seed.pixel.id},${pixelId}`, ...dateRange(seed), timezone: 'UTC' },
    });
    const defaultRange = await admin.get('/api/pixels/charts', { params: { ids: seed.pixel.id } });
    const denied = await viewer.get('/api/pixels/charts', { params: { ids: seed.pixel.id } });
    const invalid = await admin.get('/api/pixels/charts', { params: { ids: 'nope' } });
    const missing = await admin.get('/api/pixels/charts');

    expect(response.status).toBe(200);
    // `data` is keyed by pixel id; ids the caller cannot view are silently dropped.
    expect(Object.keys(response.body.data)).toContain(seed.pixel.id);
    expect(response.body.data[seed.pixel.id]).toBeTruthy();
    expect(defaultRange.status).toBe(200);
    expect(denied.status).toBe(200);
    expect(denied.body.data).toEqual({});
    expect(invalid.status).toBe(400);
    expect(missing.status).toBe(400);
  });

  test('DELETE /api/pixels/{pixelId} deletes a pixel', async ({ admin, user }) => {
    const denied = await user.del(`/api/pixels/${pixelId}`);
    const response = await admin.del(`/api/pixels/${pixelId}`);
    const gone = await admin.get(`/api/pixels/${pixelId}`);

    expect(denied.status).toBe(401);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(gone.status).toBe(200);
    expect(gone.body).toBeNull();

    pixelId = '';
  });
});
