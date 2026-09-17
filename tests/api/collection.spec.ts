import { expect, test } from './fixtures';
import { CACHE_HEADER, UNKNOWN_UUID } from './helpers/constants';
import { HOSTNAME, PERSONAS } from './seed/dataset';

const persona = PERSONAS[0];

function pageview(website: string, extra: Record<string, unknown> = {}) {
  return {
    type: 'event',
    payload: {
      website,
      hostname: HOSTNAME,
      language: persona.language,
      screen: persona.screen,
      userAgent: persona.userAgent,
      // Private IP: the test image has no GeoLite database.
      ip: '10.0.9.1',
      url: '/collection-spec',
      title: 'Collection spec',
      ...extra,
    },
  };
}

test.describe('Collection', () => {
  test.describe.configure({ mode: 'serial' });

  test('POST /api/send records a pageview and returns a cache token', async ({ api, seed }) => {
    const response = await api.post('/api/send', pageview(seed.website.id));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      cache: expect.any(String),
      sessionId: expect.any(String),
      visitId: expect.any(String),
    });
  });

  test('POST /api/send continues the visit when the cache token is sent', async ({ api, seed }) => {
    const first = await api.post('/api/send', pageview(seed.website.id));
    const second = await api.post('/api/send', pageview(seed.website.id, { url: '/second' }), {
      headers: { [CACHE_HEADER]: first.body.cache },
    });

    expect(second.status).toBe(200);
    expect(second.body.sessionId).toBe(first.body.sessionId);
    expect(second.body.visitId).toBe(first.body.visitId);
  });

  test('POST /api/send records custom, identify and performance payloads', async ({
    api,
    seed,
  }) => {
    const custom = await api.post(
      '/api/send',
      pageview(seed.website.id, { name: 'spec-event', data: { value: 1, label: 'spec' } }),
    );
    const identify = await api.post('/api/send', {
      type: 'identify',
      payload: { ...pageview(seed.website.id).payload, id: 'spec-user', data: { plan: 'spec' } },
    });
    const performance = await api.post('/api/send', {
      type: 'performance',
      payload: {
        ...pageview(seed.website.id).payload,
        lcp: 1500,
        inp: 100,
        cls: 0.1,
        fcp: 800,
        ttfb: 200,
      },
    });

    expect(custom.status).toBe(200);
    expect(identify.status).toBe(200);
    expect(performance.status).toBe(200);
  });

  test('POST /api/send accepts link and pixel sources', async ({ api, seed }) => {
    const link = await api.post('/api/send', {
      type: 'event',
      payload: { link: seed.link.id, url: '/', userAgent: persona.userAgent, ip: '10.0.9.2' },
    });
    const pixel = await api.post('/api/send', {
      type: 'event',
      payload: { pixel: seed.pixel.id, url: '/', userAgent: persona.userAgent, ip: '10.0.9.2' },
    });

    expect(link.status).toBe(200);
    expect(pixel.status).toBe(200);
  });

  test('POST /api/send rejects an unknown website', async ({ api }) => {
    const response = await api.post('/api/send', pageview(UNKNOWN_UUID));

    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({ message: 'Website not found.', status: 400 });
  });

  test('POST /api/send requires exactly one of website, link or pixel', async ({ api, seed }) => {
    const none = await api.post('/api/send', { type: 'event', payload: { url: '/' } });
    const two = await api.post('/api/send', pageview(seed.website.id, { link: seed.link.id }));

    expect(none.status).toBe(400);
    expect(two.status).toBe(400);
    expect(two.body.error.code).toBe('bad-request');
  });

  test('POST /api/send rejects invalid payloads', async ({ api, seed }) => {
    const formula = await api.post('/api/send', pageview(seed.website.id, { name: '=cmd()' }));
    const vitals = await api.post('/api/send', {
      type: 'performance',
      payload: { ...pageview(seed.website.id).payload, lcp: -1 },
    });
    const type = await api.post('/api/send', {
      type: 'bogus',
      payload: { website: seed.website.id },
    });

    expect(formula.status).toBe(400);
    expect(vitals.status).toBe(400);
    expect(type.status).toBe(400);
  });

  test('POST /api/batch processes each payload and reports per-item errors', async ({
    api,
    seed,
  }) => {
    const response = await api.post('/api/batch', [
      pageview(seed.website.id, { url: '/batch-1' }),
      pageview(UNKNOWN_UUID, { url: '/batch-2' }),
      pageview(seed.website.id, { url: '/batch-3', name: 'batch-event' }),
    ]);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      size: 3,
      processed: 2,
      errors: 1,
      cache: expect.any(String),
    });
    expect(response.body.details).toHaveLength(1);
    expect(response.body.details[0].index).toBe(1);
  });

  test('POST /api/batch validates the body', async ({ api, seed }) => {
    const object = await api.post('/api/batch', pageview(seed.website.id));
    const tooMany = await api.post(
      '/api/batch',
      Array.from({ length: 501 }, () => ({})),
    );

    expect(object.status).toBe(400);
    expect(tooMany.status).toBe(400);
  });

  test('POST /api/record stores replay and heatmap events for a recorded visit', async ({
    api,
    seed,
  }) => {
    const visit = await api.post('/api/send', pageview(seed.website.id));
    const headers = { [CACHE_HEADER]: visit.body.cache };
    const now = Date.now();

    const replay = await api.post(
      '/api/record',
      {
        type: 'record',
        payload: {
          website: seed.website.id,
          events: [
            {
              type: 4,
              data: { href: `https://${HOSTNAME}/`, width: 1280, height: 800 },
              timestamp: now,
            },
            { type: 2, data: { node: { type: 0, childNodes: [] } }, timestamp: now + 10 },
          ],
        },
      },
      { headers },
    );
    const heatmap = await api.post(
      '/api/record',
      {
        type: 'heatmap',
        payload: {
          website: seed.website.id,
          events: [
            { type: 'click', url: `https://${HOSTNAME}/`, x: 1, y: 2, timestamp: now },
            { type: 'scroll', url: `https://${HOSTNAME}/`, scrollPct: 50, timestamp: now },
          ],
        },
      },
      { headers },
    );

    expect(replay.status).toBe(200);
    expect(replay.body).toEqual({ ok: true });
    expect(heatmap.status).toBe(200);
    expect(heatmap.body).toEqual({ ok: true });
  });

  test('POST /api/record requires a session token', async ({ api, seed }) => {
    const response = await api.post('/api/record', {
      type: 'record',
      payload: { website: seed.website.id, events: [{ type: 2 }] },
    });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('Missing session token.');
  });

  test('POST /api/record reports when the recorder is disabled', async ({ api, seed }) => {
    const visit = await api.post('/api/send', pageview(seed.website2.id));
    const response = await api.post(
      '/api/record',
      { type: 'record', payload: { website: seed.website2.id, events: [{ type: 2 }] } },
      { headers: { [CACHE_HEADER]: visit.body.cache } },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: false, reason: 'recorder_disabled' });
  });

  test('POST /api/record rejects invalid and oversized payloads', async ({ api, seed }) => {
    const invalid = await api.post('/api/record', { type: 'bogus', payload: {} });
    const oversized = await api.post(
      '/api/record',
      JSON.stringify({
        type: 'record',
        payload: { website: seed.website.id, events: [{ type: 2, data: 'x'.repeat(1_000_100) }] },
      }),
      { headers: { 'content-type': 'application/json' } },
    );

    expect(invalid.status).toBe(400);
    expect(oversized.status).toBe(413);
    expect(oversized.body.error.code).toBe('payload-too-large');
  });
});
