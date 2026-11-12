import { randomUUID } from 'node:crypto';
import { expect, test } from './fixtures';
import { UNKNOWN_UUID } from './helpers/constants';
import { dateRange } from './helpers/dates';
import {
  createTeam,
  deleteTeam,
  deleteWebsite,
  uniqueDomain,
  uniqueName,
} from './helpers/entities';
import { HOSTNAME } from './seed/dataset';

test.describe('Websites', () => {
  test.describe.configure({ mode: 'serial' });

  let teamId = '';
  let websiteId = '';
  let teamWebsiteId = '';

  test.beforeAll(async ({ admin }) => {
    teamId = (await createTeam(admin)).id;
  });

  test.afterAll(async ({ admin }) => {
    for (const id of [websiteId, teamWebsiteId]) {
      if (id) {
        await deleteWebsite(admin, id);
      }
    }

    if (teamId) {
      await deleteTeam(admin, teamId);
    }
  });

  test('POST /api/websites creates a website for the current user', async ({ admin, seed }) => {
    const name = uniqueName('website');
    const domain = uniqueDomain();
    const response = await admin.post('/api/websites', { name, domain });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ name, domain, userId: seed.admin.id, shareId: null });

    websiteId = response.body.id;
  });

  test('POST /api/websites creates a website for a team', async ({ admin }) => {
    const response = await admin.post('/api/websites', {
      name: uniqueName('team-website'),
      domain: uniqueDomain(),
      teamId,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ teamId, userId: null });

    teamWebsiteId = response.body.id;
  });

  test('POST /api/websites accepts a fixed id', async ({ admin }) => {
    const id = randomUUID();
    const response = await admin.post('/api/websites', {
      id,
      name: uniqueName('website'),
      domain: uniqueDomain(),
    });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(id);

    await deleteWebsite(admin, id);
  });

  test('POST /api/websites validates the body', async ({ admin }) => {
    const domain = await admin.post('/api/websites', { name: 'x', domain: 'not a domain' });
    const name = await admin.post('/api/websites', { domain: uniqueDomain() });

    expect(domain.status).toBe(400);
    expect(domain.body.error.code).toBe('bad-request');
    expect(name.status).toBe(400);
  });

  test('POST /api/websites requires a user that can create websites', async ({ api, viewer }) => {
    const anonymous = await api.post('/api/websites', { name: 'x', domain: uniqueDomain() });
    const viewOnly = await viewer.post('/api/websites', { name: 'x', domain: uniqueDomain() });

    expect(anonymous.status).toBe(401);
    expect(viewOnly.status).toBe(401);
  });

  test('GET /api/websites lists the current user websites', async ({ admin, user }) => {
    const response = await admin.get('/api/websites');
    const search = await admin.get('/api/websites', { params: { search: 'zzz-no-such-website' } });
    const other = await user.get('/api/websites');

    expect(response.status).toBe(200);
    expect(response.body.data.map((w: any) => w.id)).toContain(websiteId);
    expect(response.body.data.map((w: any) => w.id)).not.toContain(teamWebsiteId);
    expect(search.body.data).toHaveLength(0);
    expect(other.body.data.map((w: any) => w.id)).not.toContain(websiteId);
  });

  test('GET /api/websites?includeTeams includes team websites', async ({ admin }) => {
    const response = await admin.get('/api/websites', { params: { includeTeams: 'true' } });

    expect(response.status).toBe(200);
    expect(response.body.data.map((w: any) => w.id)).toContain(teamWebsiteId);
  });

  test('GET /api/websites/{websiteId} returns a website', async ({
    admin,
    api,
    viewer,
    share,
    seed,
  }) => {
    const response = await admin.get(`/api/websites/${websiteId}`);
    const shared = await (await share()).get(`/api/websites/${seed.website.id}`);
    const anonymous = await api.get(`/api/websites/${websiteId}`);
    const denied = await viewer.get(`/api/websites/${websiteId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(websiteId);
    expect(shared.status).toBe(200);
    expect(shared.body.id).toBe(seed.website.id);
    expect(anonymous.status).toBe(401);
    expect(denied.status).toBe(401);
  });

  test('POST /api/websites/{websiteId} updates name and domain', async ({ admin, user }) => {
    const name = uniqueName('renamed');
    const domain = uniqueDomain();
    const response = await admin.post(`/api/websites/${websiteId}`, { name, domain });
    const denied = await user.post(`/api/websites/${websiteId}`, { name });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: websiteId, name, domain });
    expect(denied.status).toBe(401);
  });

  test('POST /api/websites/{websiteId} manages the legacy share id', async ({ admin }) => {
    const created = await admin.post(`/api/websites/${websiteId}`, { shareId: 'SPECSHARE1' });
    const removed = await admin.post(`/api/websites/${websiteId}`, { shareId: null });

    expect(created.status).toBe(200);
    expect(created.body.shareId).toBe('SPECSHARE1');
    expect(removed.status).toBe(200);
    expect(removed.body.shareId).toBeNull();
  });

  test('POST /api/websites/{websiteId} updates the recorder config', async ({ admin, api }) => {
    const enabled = await admin.post(`/api/websites/${websiteId}`, {
      replayConfig: { replayEnabled: true, sampleRate: 0.5, maskLevel: 'strict' },
    });
    const recorder = await api.get(`/api/websites/${websiteId}/recorder`);
    const disabled = await admin.post(`/api/websites/${websiteId}`, { replayConfig: null });
    const recorderOff = await api.get(`/api/websites/${websiteId}/recorder`);

    expect(enabled.status).toBe(200);
    expect(recorder.status).toBe(200);
    expect(recorder.body).toMatchObject({
      enabled: true,
      replayEnabled: true,
      heatmapEnabled: false,
      sampleRate: 0.5,
      maskLevel: 'strict',
    });
    expect(disabled.status).toBe(200);
    expect(recorderOff.body).toEqual({ enabled: false });
  });

  test('GET /api/websites/{websiteId}/recorder is public and CORS enabled', async ({ api }) => {
    const response = await api.get(`/api/websites/${UNKNOWN_UUID}/recorder`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ enabled: false });
    expect(response.headers['access-control-allow-origin']).toBe('*');
  });

  test('GET /api/websites/charts returns chart data for accessible websites', async ({
    admin,
    viewer,
    seed,
  }) => {
    const response = await admin.get('/api/websites/charts', {
      params: { ids: `${seed.website.id},${seed.website2.id}` },
    });
    const denied = await viewer.get('/api/websites/charts', { params: { ids: seed.website.id } });
    const invalid = await admin.get('/api/websites/charts', { params: { ids: 'nope' } });

    expect(response.status).toBe(200);
    // `data` is keyed by website id; ids the caller cannot view are silently dropped.
    expect(Object.keys(response.body.data).sort()).toEqual(
      [seed.website.id, seed.website2.id].sort(),
    );
    expect(denied.status).toBe(200);
    expect(denied.body.data).toEqual({});
    expect(invalid.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/daterange returns the data window', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.get(`/api/websites/${seed.website.id}/daterange`);
    const shared = await (await share()).get(`/api/websites/${seed.website.id}/daterange`);
    const denied = await viewer.get(`/api/websites/${seed.website.id}/daterange`);

    expect(response.status).toBe(200);
    expect(new Date(response.body.startDate).getTime()).toBeGreaterThanOrEqual(seed.range.startAt);
    expect(new Date(response.body.endDate).getTime()).toBeGreaterThanOrEqual(
      new Date(response.body.startDate).getTime(),
    );
    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
  });

  test('GET /api/websites/{websiteId}/export returns a zip archive', async ({
    admin,
    share,
    seed,
  }) => {
    const response = await admin.get(`/api/websites/${seed.website.id}/export`, {
      params: dateRange(seed),
    });
    const shared = await (await share()).get(`/api/websites/${seed.website.id}/export`, {
      params: dateRange(seed),
    });
    const missingRange = await admin.get(`/api/websites/${seed.website.id}/export`);

    expect(response.status).toBe(200);
    // base64 of the "PK\x03\x04" zip signature
    expect(response.body.zip).toMatch(/^UEsDB/);
    expect(shared.status).toBe(401);
    expect(missingRange.status).toBe(400);
  });

  test('POST /api/websites/{websiteId}/reset clears the website data', async ({
    admin,
    api,
    user,
  }) => {
    await api.post('/api/send', {
      type: 'event',
      payload: { website: websiteId, hostname: HOSTNAME, url: '/reset', ip: '10.0.9.3' },
    });

    const denied = await user.post(`/api/websites/${websiteId}/reset`);
    const response = await admin.post(`/api/websites/${websiteId}/reset`);
    const website = await admin.get(`/api/websites/${websiteId}`);

    expect(denied.status).toBe(401);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(website.body.resetAt).toBeTruthy();
  });

  test('POST /api/websites/{websiteId}/transfer moves a website between owners', async ({
    admin,
    user,
    seed,
  }) => {
    const toTeam = await admin.post(`/api/websites/${websiteId}/transfer`, { teamId });
    const toUser = await admin.post(`/api/websites/${websiteId}/transfer`, {
      userId: seed.admin.id,
    });
    const empty = await admin.post(`/api/websites/${websiteId}/transfer`, {});
    const denied = await user.post(`/api/websites/${websiteId}/transfer`, { userId: seed.user.id });

    expect(toTeam.status).toBe(200);
    expect(toTeam.body).toMatchObject({ teamId, userId: null });
    expect(toUser.status).toBe(200);
    expect(toUser.body).toMatchObject({ teamId: null, userId: seed.admin.id });
    expect(empty.status).toBe(400);
    expect(denied.status).toBe(401);
  });

  test('DELETE /api/websites/{websiteId} deletes a website', async ({ admin, user }) => {
    const denied = await user.del(`/api/websites/${teamWebsiteId}`);
    const response = await admin.del(`/api/websites/${websiteId}`);
    const gone = await admin.get(`/api/websites/${websiteId}`);

    expect(denied.status).toBe(401);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(gone.body).toBeNull();

    websiteId = '';
  });
});
