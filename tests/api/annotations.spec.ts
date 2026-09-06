import { expect, test } from './fixtures';
import { UNKNOWN_UUID } from './helpers/constants';
import { createWebsite, deleteWebsite, uniqueName } from './helpers/entities';

test.describe('Annotations', () => {
  test.describe.configure({ mode: 'serial' });

  const date = new Date('2026-01-15T12:00:00.000Z');

  let websiteId = '';
  let annotationId = '';
  let base = '';

  test.beforeAll(async ({ admin }) => {
    websiteId = (await createWebsite(admin)).id;
    base = `/api/websites/${websiteId}/annotations`;
  });

  test.afterAll(async ({ admin }) => {
    if (websiteId) {
      await deleteWebsite(admin, websiteId);
    }
  });

  test('POST /api/websites/{websiteId}/annotations creates an annotation', async ({
    admin,
    seed,
  }) => {
    const note = uniqueName('note');
    const response = await admin.post(base, { date: date.toISOString(), note });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      websiteId,
      userId: seed.admin.id,
      date: date.toISOString(),
      allDay: true,
      note,
      createdAt: expect.any(String),
    });

    annotationId = response.body.id;
  });

  test('POST /api/websites/{websiteId}/annotations validates and requires permission', async ({
    admin,
    user,
    viewer,
    api,
  }) => {
    const missingNote = await admin.post(base, { date: date.toISOString() });
    const emptyNote = await admin.post(base, { date: date.toISOString(), note: '' });
    const badDate = await admin.post(base, { date: 'not-a-date', note: 'x' });
    const tooLong = await admin.post(base, { date: date.toISOString(), note: 'x'.repeat(501) });
    const notOwner = await user.post(base, { date: date.toISOString(), note: 'x' });
    const denied = await viewer.post(base, { date: date.toISOString(), note: 'x' });
    const anonymous = await api.post(base, { date: date.toISOString(), note: 'x' });

    expect(missingNote.status).toBe(400);
    expect(emptyNote.status).toBe(400);
    expect(badDate.status).toBe(400);
    expect(tooLong.status).toBe(400);
    expect(notOwner.status).toBe(401);
    expect(denied.status).toBe(401);
    expect(anonymous.status).toBe(401);
  });

  test('GET /api/websites/{websiteId}/annotations lists annotations', async ({
    admin,
    viewer,
    share,
    seed,
  }) => {
    const response = await admin.get(base);
    const inRange = await admin.get(base, {
      params: { startAt: date.getTime() - 1000, endAt: date.getTime() + 1000 },
    });
    const outOfRange = await admin.get(base, {
      params: { startAt: date.getTime() + 86_400_000, endAt: date.getTime() + 2 * 86_400_000 },
    });
    const search = await admin.get(base, { params: { search: 'zzz-no-such-note' } });
    const paged = await admin.get(base, { params: { page: 1, pageSize: 1 } });
    const denied = await viewer.get(base);
    const shared = await (await share()).get(`/api/websites/${seed.website.id}/annotations`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: expect.any(Array),
      count: 1,
      page: 1,
      pageSize: expect.any(Number),
    });
    expect(response.body.data[0]).toMatchObject({ id: annotationId, websiteId });
    expect(inRange.body.data.map((a: any) => a.id)).toEqual([annotationId]);
    expect(outOfRange.body.data).toHaveLength(0);
    expect(search.body.data).toHaveLength(0);
    expect(paged.body.pageSize).toBe(1);
    expect(denied.status).toBe(401);
    expect(shared.status).toBe(200);
  });

  test('GET /api/websites/{websiteId}/annotations/{annotationId} returns an annotation', async ({
    admin,
    viewer,
  }) => {
    const response = await admin.get(`${base}/${annotationId}`);
    const denied = await viewer.get(`${base}/${annotationId}`);
    const unknown = await admin.get(`${base}/${UNKNOWN_UUID}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: annotationId, websiteId, allDay: true });
    expect(denied.status).toBe(401);
    expect(unknown.status).toBe(404);
  });

  test('POST /api/websites/{websiteId}/annotations/{annotationId} updates an annotation', async ({
    admin,
    user,
  }) => {
    const note = uniqueName('updated');
    const newDate = new Date('2026-02-01T08:30:00.000Z');
    const response = await admin.post(`${base}/${annotationId}`, {
      date: newDate.toISOString(),
      note,
      allDay: false,
    });
    const invalid = await admin.post(`${base}/${annotationId}`, { date: newDate.toISOString() });
    const unknown = await admin.post(`${base}/${UNKNOWN_UUID}`, {
      date: newDate.toISOString(),
      note,
    });
    const denied = await user.post(`${base}/${annotationId}`, {
      date: newDate.toISOString(),
      note,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: annotationId,
      date: newDate.toISOString(),
      note,
      allDay: false,
    });
    expect(invalid.status).toBe(400);
    expect(unknown.status).toBe(404);
    expect(denied.status).toBe(401);
  });

  test('DELETE /api/websites/{websiteId}/annotations/{annotationId} deletes an annotation', async ({
    admin,
    user,
  }) => {
    const denied = await user.del(`${base}/${annotationId}`);
    const response = await admin.del(`${base}/${annotationId}`);
    const gone = await admin.get(`${base}/${annotationId}`);
    const again = await admin.del(`${base}/${annotationId}`);

    expect(denied.status).toBe(401);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(gone.status).toBe(404);
    expect(again.status).toBe(404);

    annotationId = '';
  });
});
