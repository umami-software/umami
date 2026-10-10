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
});
