import { expect, test } from './fixtures';

test.describe('System', () => {
  test('GET /api/heartbeat responds without authentication', async ({ api }) => {
    const response = await api.get('/api/heartbeat');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  test('GET /api/config reports the runtime feature flags', async ({ api, seed }) => {
    const response = await api.get('/api/config');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      cloudMode: false,
      privateMode: false,
      // Session deletion is only supported when analytics live in Postgres.
      sessionDeletionEnabled: seed.db === 'postgres',
    });
    expect(typeof response.body.telemetryDisabled).toBe('boolean');
    expect(typeof response.body.updatesDisabled).toBe('boolean');
  });

  test('GET /api/scripts/telemetry serves a javascript response', async ({ api }) => {
    const response = await api.get('/api/scripts/telemetry');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('javascript');
    expect(response.text.length).toBeGreaterThan(0);
  });
});
