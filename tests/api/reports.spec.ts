import { expect, test } from './fixtures';
import { UNKNOWN_UUID } from './helpers/constants';
import { dateRange, dateRangeIso } from './helpers/dates';
import { uniqueName } from './helpers/entities';
import type { SeedState } from './seed/state';

/** Body shared by every report run endpoint (filters + parameters date windows). */
function runBody(seed: SeedState, type: string, parameters: Record<string, unknown> = {}) {
  return {
    websiteId: seed.website.id,
    type,
    filters: { ...dateRange(seed), timezone: 'UTC', unit: 'day' },
    parameters: { ...dateRangeIso(seed), ...parameters },
  };
}

test.describe('Saved reports', () => {
  test.describe.configure({ mode: 'serial' });

  let reportId = '';

  test.afterAll(async ({ admin }) => {
    if (reportId) {
      await admin.del(`/api/reports/${reportId}`);
    }
  });

  test('POST /api/reports creates a report', async ({ admin, seed }) => {
    const name = uniqueName('report');
    const response = await admin.post('/api/reports', {
      websiteId: seed.website.id,
      type: 'funnel',
      name,
      description: 'created by the api suite',
      parameters: { window: 60, steps: [] },
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      userId: seed.admin.id,
      websiteId: seed.website.id,
      type: 'funnel',
      name,
      description: 'created by the api suite',
      parameters: { window: 60, steps: [] },
    });

    reportId = response.body.id;
  });

  test('POST /api/reports validates the body', async ({ admin, seed }) => {
    const badType = await admin.post('/api/reports', {
      websiteId: seed.website.id,
      type: 'nope',
      name: 'x',
      parameters: {},
    });
    const missingParameters = await admin.post('/api/reports', {
      websiteId: seed.website.id,
      type: 'goal',
      name: 'x',
    });
    const longName = await admin.post('/api/reports', {
      websiteId: seed.website.id,
      type: 'goal',
      name: 'x'.repeat(201),
      parameters: {},
    });

    expect(badType.status).toBe(400);
    expect(missingParameters.status).toBe(400);
    expect(longName.status).toBe(400);
  });

  test('POST /api/reports requires update access to the website', async ({
    viewer,
    user,
    api,
    seed,
  }) => {
    const body = { websiteId: seed.website.id, type: 'goal', name: 'x', parameters: {} };
    const denied = await viewer.post('/api/reports', body);
    const otherOwner = await user.post('/api/reports', body);
    const anonymous = await api.post('/api/reports', body);
    const unknown = await user.post('/api/reports', { ...body, websiteId: UNKNOWN_UUID });

    expect(denied.status).toBe(401);
    expect(otherOwner.status).toBe(401);
    expect(anonymous.status).toBe(401);
    expect(unknown.status).toBe(401);
  });

  test('GET /api/reports lists reports for a website', async ({ admin, seed }) => {
    const response = await admin.get('/api/reports', { params: { websiteId: seed.website.id } });
    const byType = await admin.get('/api/reports', {
      params: { websiteId: seed.website.id, type: 'funnel' },
    });
    const otherType = await admin.get('/api/reports', {
      params: { websiteId: seed.website.id, type: 'retention' },
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: expect.any(Array),
      count: expect.any(Number),
      page: 1,
      pageSize: expect.any(Number),
    });
    expect(response.body.data.map((r: any) => r.id)).toContain(reportId);
    expect(byType.status).toBe(200);
    expect(byType.body.data.map((r: any) => r.id)).toContain(reportId);
    expect(byType.body.data.every((r: any) => r.type === 'funnel')).toBe(true);
    expect(otherType.body.data.map((r: any) => r.id)).not.toContain(reportId);
  });

  test('GET /api/reports validates websiteId and checks access', async ({
    admin,
    viewer,
    share,
    seed,
  }) => {
    const missing = await admin.get('/api/reports');
    const invalid = await admin.get('/api/reports', { params: { websiteId: 'nope' } });
    const badType = await admin.get('/api/reports', {
      params: { websiteId: seed.website.id, type: 'nope' },
    });
    const denied = await viewer.get('/api/reports', { params: { websiteId: seed.website.id } });
    const shared = await (await share()).get('/api/reports', {
      params: { websiteId: seed.website.id },
    });
    const sharedByType = await (await share()).get('/api/reports', {
      params: { websiteId: seed.website.id, type: 'funnel' },
    });

    expect(missing.status).toBe(400);
    expect(invalid.status).toBe(400);
    expect(badType.status).toBe(400);
    expect(denied.status).toBe(401);
    // Listing every type requires a real user; a share token can only list a single section.
    expect(shared.status).toBe(401);
    expect(sharedByType.status).toBe(200);
    expect(sharedByType.body.data.map((r: any) => r.id)).toContain(reportId);
  });

  test('GET /api/websites/{websiteId}/reports lists the website reports', async ({
    admin,
    viewer,
    seed,
  }) => {
    const response = await admin.get(`/api/websites/${seed.website.id}/reports`);
    const byType = await admin.get(`/api/websites/${seed.website.id}/reports`, {
      params: { type: 'retention' },
    });
    const badType = await admin.get(`/api/websites/${seed.website.id}/reports`, {
      params: { type: 'nope' },
    });
    const denied = await viewer.get(`/api/websites/${seed.website.id}/reports`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ data: expect.any(Array), count: expect.any(Number) });
    expect(response.body.data.map((r: any) => r.id)).toContain(reportId);
    expect(byType.status).toBe(200);
    expect(byType.body.data.map((r: any) => r.id)).not.toContain(reportId);
    expect(badType.status).toBe(400);
    expect(denied.status).toBe(401);
  });

  test('GET /api/reports/{reportId} returns a report', async ({ admin, viewer, api }) => {
    const response = await admin.get(`/api/reports/${reportId}`);
    const denied = await viewer.get(`/api/reports/${reportId}`);
    const anonymous = await api.get(`/api/reports/${reportId}`);
    const unknown = await admin.get(`/api/reports/${UNKNOWN_UUID}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: reportId,
      type: 'funnel',
      parameters: { window: 60 },
      createdAt: expect.any(String),
    });
    expect(denied.status).toBe(401);
    expect(anonymous.status).toBe(401);
    expect(unknown.status).toBe(404);
  });

  test('POST /api/reports/{reportId} updates a report', async ({ admin, viewer, seed }) => {
    const name = uniqueName('renamed');
    const body = {
      websiteId: seed.website.id,
      type: 'funnel',
      name,
      description: 'updated',
      parameters: { window: 30, steps: [{ type: 'path', value: '/' }] },
    };
    const response = await admin.post(`/api/reports/${reportId}`, body);
    const invalid = await admin.post(`/api/reports/${reportId}`, { name });
    const denied = await viewer.post(`/api/reports/${reportId}`, body);
    const unknown = await admin.post(`/api/reports/${UNKNOWN_UUID}`, body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: reportId,
      name,
      description: 'updated',
      parameters: { window: 30 },
    });
    expect(invalid.status).toBe(400);
    expect(denied.status).toBe(401);
    expect(unknown.status).toBe(404);
  });

  test('DELETE /api/reports/{reportId} deletes a report', async ({ admin, viewer }) => {
    const denied = await viewer.del(`/api/reports/${reportId}`);
    const response = await admin.del(`/api/reports/${reportId}`);
    const gone = await admin.get(`/api/reports/${reportId}`);
    const unknown = await admin.del(`/api/reports/${UNKNOWN_UUID}`);

    expect(denied.status).toBe(401);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(gone.status).toBe(404);
    expect(unknown.status).toBe(404);

    reportId = '';
  });
});

test.describe('Report runs', () => {
  test('POST /api/reports/attribution returns attribution by channel', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.post(
      '/api/reports/attribution',
      runBody(seed, 'attribution', { model: 'first-click', type: 'path', step: '/pricing' }),
    );
    const lastClick = await admin.post(
      '/api/reports/attribution',
      runBody(seed, 'attribution', { model: 'last-click', type: 'event', step: 'signup' }),
    );
    const shared = await (await share()).post(
      '/api/reports/attribution',
      runBody(seed, 'attribution', { model: 'first-click', type: 'path', step: '/pricing' }),
    );
    const invalid = await admin.post(
      '/api/reports/attribution',
      runBody(seed, 'attribution', { model: 'nope', type: 'path', step: '/' }),
    );
    const denied = await viewer.post(
      '/api/reports/attribution',
      runBody(seed, 'attribution', { model: 'first-click', type: 'path', step: '/' }),
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      referrer: expect.any(Array),
      paidAds: expect.any(Array),
      utm_source: expect.any(Array),
      utm_medium: expect.any(Array),
      utm_campaign: expect.any(Array),
      utm_content: expect.any(Array),
      utm_term: expect.any(Array),
      total: {
        pageviews: expect.any(Number),
        visitors: expect.any(Number),
        visits: expect.any(Number),
      },
    });
    expect(response.body.total.visitors).toBeGreaterThan(0);
    expect(lastClick.status).toBe(200);
    expect(shared.status).toBe(200);
    expect(invalid.status).toBe(400);
    expect(denied.status).toBe(401);
  });

  test('POST /api/reports/breakdown returns rows grouped by field', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.post(
      '/api/reports/breakdown',
      runBody(seed, 'breakdown', { fields: ['path'] }),
    );
    const multi = await admin.post(
      '/api/reports/breakdown',
      runBody(seed, 'breakdown', { fields: ['browser', 'os'] }),
    );
    const shared = await (await share()).post(
      '/api/reports/breakdown',
      runBody(seed, 'breakdown', { fields: ['path'] }),
    );
    const invalid = await admin.post(
      '/api/reports/breakdown',
      runBody(seed, 'breakdown', { fields: ['nope'] }),
    );
    const denied = await viewer.post(
      '/api/reports/breakdown',
      runBody(seed, 'breakdown', { fields: ['path'] }),
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // Aggregates come back as numeric strings on Postgres and numbers on ClickHouse.
    expect(response.body[0]).toMatchObject({
      path: expect.any(String),
      views: expect.anything(),
      visitors: expect.anything(),
      visits: expect.anything(),
      bounces: expect.anything(),
      totaltime: expect.anything(),
    });
    expect(Number(response.body[0].views)).toBeGreaterThan(0);
    expect(response.body.map((r: any) => r.path)).toContain('/pricing');
    expect(multi.status).toBe(200);
    expect(multi.body[0]).toMatchObject({ browser: expect.any(String), os: expect.any(String) });
    expect(shared.status).toBe(200);
    expect(invalid.status).toBe(400);
    expect(denied.status).toBe(401);
  });

  test('POST /api/reports/funnel returns conversion per step', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const parameters = {
      window: 60,
      steps: [
        { type: 'path', value: '/' },
        { type: 'path', value: '/pricing' },
        { type: 'path', value: '/blog/hello-world' },
      ],
    };
    const response = await admin.post('/api/reports/funnel', runBody(seed, 'funnel', parameters));
    const shared = await (await share()).post(
      '/api/reports/funnel',
      runBody(seed, 'funnel', parameters),
    );
    const tooFewSteps = await admin.post(
      '/api/reports/funnel',
      runBody(seed, 'funnel', { window: 60, steps: [{ type: 'path', value: '/' }] }),
    );
    const denied = await viewer.post('/api/reports/funnel', runBody(seed, 'funnel', parameters));

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toMatchObject({
      type: 'path',
      value: '/',
      visitors: expect.any(Number),
      previous: expect.any(Number),
      dropped: expect.any(Number),
      remaining: expect.any(Number),
    });
    expect(response.body[1]).toMatchObject({ value: '/pricing', dropoff: expect.any(Number) });
    expect(response.body[0].visitors).toBeGreaterThan(0);
    expect(response.body[1].visitors).toBeGreaterThan(0);
    expect(response.body[1].visitors).toBeLessThanOrEqual(response.body[0].visitors);
    expect(response.body[2].visitors).toBeLessThanOrEqual(response.body[1].visitors);
    expect(shared.status).toBe(200);
    expect(tooFewSteps.status).toBe(400);
    expect(denied.status).toBe(401);
  });

  test('POST /api/reports/goal returns goal completion', async ({ admin, share, viewer, seed }) => {
    const response = await admin.post(
      '/api/reports/goal',
      runBody(seed, 'goal', { type: 'path', value: '/' }),
    );
    const event = await admin.post(
      '/api/reports/goal',
      runBody(seed, 'goal', { type: 'event', value: 'signup' }),
    );
    const shared = await (await share()).post(
      '/api/reports/goal',
      runBody(seed, 'goal', { type: 'path', value: '/' }),
    );
    const invalid = await admin.post('/api/reports/goal', runBody(seed, 'goal', { type: 'path' }));
    const denied = await viewer.post(
      '/api/reports/goal',
      runBody(seed, 'goal', { type: 'path', value: '/' }),
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ num: expect.any(Number), total: expect.any(Number) });
    expect(response.body.num).toBeGreaterThan(0);
    expect(response.body.total).toBeGreaterThanOrEqual(response.body.num);
    expect(event.status).toBe(200);
    expect(event.body.num).toBeGreaterThan(0);
    expect(shared.status).toBe(200);
    expect(invalid.status).toBe(400);
    expect(denied.status).toBe(401);
  });

  test('POST /api/reports/heatmap returns click and scroll data', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.post(
      '/api/reports/heatmap',
      runBody(seed, 'heatmap', { urlPath: '/', mode: 'click' }),
    );
    const scroll = await admin.post(
      '/api/reports/heatmap',
      runBody(seed, 'heatmap', { urlPath: '/', mode: 'scroll' }),
    );
    const invalid = await admin.post(
      '/api/reports/heatmap',
      runBody(seed, 'heatmap', { urlPath: '/', mode: 'nope' }),
    );
    const shared = await (await share()).post(
      '/api/reports/heatmap',
      runBody(seed, 'heatmap', { urlPath: '/' }),
    );
    const denied = await viewer.post(
      '/api/reports/heatmap',
      runBody(seed, 'heatmap', { urlPath: '/' }),
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      mode: 'click',
      pages: expect.any(Array),
      points: expect.any(Array),
      scroll: { buckets: expect.any(Array), totalSessions: expect.any(Number) },
    });
    expect(response.body.pages.map((p: any) => p.urlPath ?? p.url ?? p.path)).toContain('/');
    expect(scroll.status).toBe(200);
    expect(scroll.body.mode).toBe('scroll');
    expect(invalid.status).toBe(400);
    // Heatmaps require a logged in user; share tokens are rejected.
    expect(shared.status).toBe(401);
    expect(denied.status).toBe(401);
  });

  test('POST /api/reports/journey returns paths between steps', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.post(
      '/api/reports/journey',
      runBody(seed, 'journey', { steps: 3 }),
    );
    const anchored = await admin.post(
      '/api/reports/journey',
      runBody(seed, 'journey', { steps: 3, startStep: '/' }),
    );
    const shared = await (await share()).post(
      '/api/reports/journey',
      runBody(seed, 'journey', { steps: 3 }),
    );
    const invalid = await admin.post(
      '/api/reports/journey',
      runBody(seed, 'journey', { steps: 1 }),
    );
    const denied = await viewer.post(
      '/api/reports/journey',
      runBody(seed, 'journey', { steps: 3 }),
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toMatchObject({ items: expect.any(Array), count: expect.any(Number) });
    expect(response.body[0].items.length).toBeGreaterThan(0);
    expect(anchored.status).toBe(200);
    expect(anchored.body.length).toBeGreaterThan(0);
    expect(anchored.body.every((r: any) => r.items[0] === '/')).toBe(true);
    expect(shared.status).toBe(200);
    expect(invalid.status).toBe(400);
    expect(denied.status).toBe(401);
  });

  test('POST /api/reports/performance returns web vitals', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.post(
      '/api/reports/performance',
      runBody(seed, 'performance', { unit: 'day', timezone: 'UTC' }),
    );
    const metric = await admin.post(
      '/api/reports/performance',
      runBody(seed, 'performance', { metric: 'lcp' }),
    );
    const shared = await (await share()).post(
      '/api/reports/performance',
      runBody(seed, 'performance'),
    );
    const invalid = await admin.post(
      '/api/reports/performance',
      runBody(seed, 'performance', { metric: 'nope' }),
    );
    const denied = await viewer.post('/api/reports/performance', runBody(seed, 'performance'));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      chart: expect.any(Array),
      summary: { count: expect.any(Number) },
      pages: expect.any(Array),
      pageTitles: expect.any(Array),
      devices: expect.any(Array),
      browsers: expect.any(Array),
    });
    expect(response.body.summary.count).toBeGreaterThan(0);
    expect(metric.status).toBe(200);
    expect(shared.status).toBe(200);
    expect(invalid.status).toBe(400);
    expect(denied.status).toBe(401);
  });

  test('POST /api/reports/retention returns cohorts by day', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.post(
      '/api/reports/retention',
      runBody(seed, 'retention', { timezone: 'UTC' }),
    );
    const shared = await (await share()).post('/api/reports/retention', runBody(seed, 'retention'));
    const denied = await viewer.post('/api/reports/retention', runBody(seed, 'retention'));

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toMatchObject({
      date: expect.any(String),
      day: expect.any(Number),
      visitors: expect.any(Number),
      returnVisitors: expect.any(Number),
      percentage: expect.any(Number),
    });
    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
  });

  test('POST /api/reports/revenue returns revenue totals', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.post(
      '/api/reports/revenue',
      runBody(seed, 'revenue', { currency: seed.data.currency }),
    );
    const shared = await (await share()).post(
      '/api/reports/revenue',
      runBody(seed, 'revenue', { currency: seed.data.currency }),
    );
    const missingCurrency = await admin.post('/api/reports/revenue', runBody(seed, 'revenue'));
    const denied = await viewer.post(
      '/api/reports/revenue',
      runBody(seed, 'revenue', { currency: seed.data.currency }),
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      chart: expect.any(Array),
      total: {
        sum: expect.anything(),
        count: expect.anything(),
        average: expect.anything(),
        unique_count: expect.anything(),
      },
      country: expect.any(Array),
      region: expect.any(Array),
      referrer: expect.any(Array),
      channel: expect.any(Array),
    });
    expect(Number(response.body.total.sum)).toBeGreaterThan(0);
    expect(Number(response.body.total.count)).toBeGreaterThan(0);
    expect(shared.status).toBe(200);
    expect(missingCurrency.status).toBe(400);
    expect(denied.status).toBe(401);
  });

  test('POST /api/reports/utm returns views per utm parameter', async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const response = await admin.post('/api/reports/utm', runBody(seed, 'utm'));
    const shared = await (await share()).post('/api/reports/utm', runBody(seed, 'utm'));
    const denied = await viewer.post('/api/reports/utm', runBody(seed, 'utm'));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      utm_source: expect.any(Array),
      utm_medium: expect.any(Array),
      utm_campaign: expect.any(Array),
      utm_term: expect.any(Array),
      utm_content: expect.any(Array),
    });
    expect(response.body.utm_source[0]).toMatchObject({
      utm: expect.any(String),
      views: expect.any(Number),
    });
    expect(response.body.utm_source.map((r: any) => r.utm)).toContain('newsletter');
    expect(response.body.utm_medium.map((r: any) => r.utm)).toContain('email');
    expect(response.body.utm_campaign.map((r: any) => r.utm)).toContain('launch');
    expect(shared.status).toBe(200);
    expect(denied.status).toBe(401);
  });

  test('POST /api/reports/{type} validates the discriminator and envelope', async ({
    admin,
    user,
    api,
    seed,
  }) => {
    const wrongType = await admin.post('/api/reports/utm', runBody(seed, 'goal'));
    const missingFilters = await admin.post('/api/reports/utm', {
      websiteId: seed.website.id,
      type: 'utm',
      parameters: dateRangeIso(seed),
    });
    const missingParameters = await admin.post('/api/reports/utm', {
      websiteId: seed.website.id,
      type: 'utm',
      filters: dateRange(seed),
    });
    const anonymous = await api.post('/api/reports/utm', runBody(seed, 'utm'));
    const unknownWebsite = await user.post('/api/reports/utm', {
      ...runBody(seed, 'utm'),
      websiteId: UNKNOWN_UUID,
    });

    expect(wrongType.status).toBe(400);
    expect(missingFilters.status).toBe(400);
    expect(missingParameters.status).toBe(400);
    expect(anonymous.status).toBe(401);
    expect(unknownWebsite.status).toBe(401);
  });
});
