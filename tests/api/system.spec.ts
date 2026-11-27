import { expect, test } from './fixtures';

test.describe('System', () => {
  test('GET /api/heartbeat responds without authentication', async ({ api }) => {
    const response = await api.get('/api/heartbeat');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  test('GET /api/scripts/telemetry serves a javascript response', async ({ api }) => {
    const response = await api.get('/api/scripts/telemetry');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('javascript');
    expect(response.text.length).toBeGreaterThan(0);
  });

  test('GET /api/admin/installation returns inventory and record counts', async ({ admin }) => {
    const inventory = await admin.get('/api/admin/installation');
    const records = await admin.get('/api/admin/installation', {
      params: { section: 'records' },
    });

    expect(inventory.status).toBe(200);
    expect(inventory.body).toEqual({
      users: expect.any(Number),
      teams: expect.any(Number),
      websites: expect.any(Number),
    });
    expect(records.status).toBe(200);
    expect(records.body).toEqual({
      websiteEvents: expect.any(Number),
      sessions: expect.any(Number),
    });
  });

  test('GET /api/admin/installation requires an administrator session', async ({ api, user }) => {
    expect((await api.get('/api/admin/installation')).status).toBe(401);
    expect((await user.get('/api/admin/installation')).status).toBe(403);
  });
});
