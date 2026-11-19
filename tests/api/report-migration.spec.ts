import { serializeAnalyticsQuery } from '../../src/lib/analytics-query';
import { expect, test } from './fixtures';
import { dateRange } from './helpers/dates';
import { uniqueName } from './helpers/entities';

const calculations = [
  ['journey', 'journeys', { steps: 3 }],
  ['retention', 'retention', {}],
  ['breakdown', 'breakdown', { fields: ['path', 'country'] }],
  ['attribution', 'attribution', { model: 'first-click', type: 'path', step: '/pricing' }],
  ['heatmap', 'heatmaps', { mode: 'click', urlPath: '/' }],
  [
    'funnel',
    'funnels/stats',
    {
      window: 60,
      steps: [
        { type: 'path', value: '/' },
        { type: 'path', value: '/pricing' },
      ],
    },
  ],
  ['goal', 'goals/stats', { type: 'path', value: '/' }],
] as const;

// SQL rankings can have ties, so compare result content independently of tied row order.
function canonical(value: any): any {
  if (Array.isArray(value))
    return value.map(canonical).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map(key => [key, canonical(value[key])]),
    );
  return value;
}

for (const [type, path, parameters] of calculations) {
  test(`GET ${path} matches legacy ${type} results and access`, async ({
    admin,
    share,
    viewer,
    seed,
  }) => {
    const range = { ...dateRange(seed), timezone: 'UTC', unit: 'day' };
    const body = {
      websiteId: seed.website.id,
      type,
      filters: range,
      parameters: {
        startDate: new Date(range.startAt).toISOString(),
        endDate: new Date(range.endAt).toISOString(),
        timezone: 'UTC',
        unit: 'day',
        ...parameters,
      },
    };
    const url = `/api/websites/${seed.website.id}/${path}`;
    const params = serializeAnalyticsQuery({ ...range, ...parameters });
    const legacy = await admin.post(`/api/reports/${type}`, body);
    const result = await admin.get(url, { params });
    expect(legacy.status).toBe(200);
    expect(result.status).toBe(200);
    expect(canonical(result.body)).toEqual(canonical(legacy.body));
    expect((await viewer.get(url, { params })).status).toBe(401);
    expect((await (await share()).get(url, { params })).status).toBe(
      type === 'heatmap' ? 401 : 200,
    );
    expect((await admin.get(url)).status).toBe(400);
  });
}

for (const [type, parameters] of [
  [
    'funnel',
    {
      window: 60,
      steps: [
        { type: 'path', value: '/' },
        { type: 'event', value: 'signup' },
      ],
    },
  ],
  ['goal', { type: 'path', value: '/' }],
] as const) {
  test(`${type} definitions preserve IDs and scope saved stats to the website`, async ({
    admin,
    viewer,
    share,
    seed,
  }) => {
    const base = `/api/websites/${seed.website.id}/${type}s`;
    const created = await admin.post(base, { name: uniqueName(type), parameters });
    expect(created.status).toBe(200);
    const id = created.body.id;
    try {
      expect((await admin.get(`/api/reports/${id}`)).body.id).toBe(id);
      expect((await admin.get(`${base}/${id}`)).body.parameters).toEqual(parameters);
      expect((await (await share()).get(base)).status).toBe(200);
      const range = dateRange(seed);
      const saved = await admin.get(`${base}/${id}/stats`, { params: range });
      const preview = await admin.get(`${base}/stats`, {
        params: serializeAnalyticsQuery({ ...range, ...parameters }),
      });
      expect(saved.status).toBe(200);
      expect(saved.body).toEqual(preview.body);
      expect((await viewer.post(`${base}/${id}`, { name: 'Denied', parameters })).status).toBe(401);
      const otherBase = `/api/websites/${seed.website2.id}/${type}s/${id}`;
      expect((await admin.get(otherBase)).status).toBe(404);
      expect((await admin.post(otherBase, { name: 'Wrong website', parameters })).status).toBe(404);
      expect((await admin.del(otherBase)).status).toBe(404);
      const otherType = type === 'goal' ? 'funnels' : 'goals';
      expect((await admin.get(`/api/websites/${seed.website.id}/${otherType}/${id}`)).status).toBe(
        404,
      );
      const updated = await admin.post(`${base}/${id}`, {
        name: 'Updated',
        websiteId: seed.website2.id,
        type: otherType,
        parameters,
      });
      expect(updated.status).toBe(200);
      expect(updated.body).toMatchObject({ id, name: 'Updated', websiteId: seed.website.id, type });
    } finally {
      expect((await admin.del(`${base}/${id}`)).status).toBe(200);
    }
    expect((await admin.get(`${base}/${id}`)).status).toBe(404);
  });
}

test('performance and UTM datasets reproduce legacy aggregates', async ({
  admin,
  viewer,
  share,
  seed,
}) => {
  const range = { ...dateRange(seed), timezone: 'UTC', unit: 'day' };
  const body = (type: string) => ({
    websiteId: seed.website.id,
    type,
    filters: range,
    parameters: {
      startDate: new Date(range.startAt).toISOString(),
      endDate: new Date(range.endAt).toISOString(),
      timezone: 'UTC',
      unit: 'day',
      metric: 'lcp',
    },
  });
  const base = `/api/websites/${seed.website.id}`;
  const performance = await admin.post('/api/reports/performance', body('performance'));
  expect(performance.status).toBe(200);
  for (const [path, key] of [
    ['performance/stats', 'summary'],
    ['performance/chart', 'chart'],
  ] as const) {
    const response = await admin.get(`${base}/${path}`, { params: range });
    expect(response.status).toBe(200);
    expect(canonical(key === 'chart' ? response.body.chart : response.body)).toEqual(
      canonical(performance.body[key]),
    );
    expect((await viewer.get(`${base}/${path}`, { params: range })).status).toBe(401);
    expect((await (await share()).get(`${base}/${path}`, { params: range })).status).toBe(200);
  }
  for (const [type, key] of [
    ['path', 'pages'],
    ['title', 'pageTitles'],
    ['device', 'devices'],
    ['browser', 'browsers'],
  ]) {
    const response = await admin.get(`${base}/performance/metrics`, { params: { ...range, type } });
    expect(response.status).toBe(200);
    expect(canonical(response.body)).toEqual(canonical(performance.body[key]));
  }
  const utm = await admin.post('/api/reports/utm', body('utm'));
  expect(utm.status).toBe(200);
  for (const type of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const response = await admin.get(`${base}/utm/metrics`, { params: { ...range, type } });
    expect(response.status).toBe(200);
    expect(canonical(response.body)).toEqual(canonical(utm.body[type]));
  }
  expect(
    (await admin.get(`${base}/utm/metrics`, { params: { ...range, type: 'invalid' } })).status,
  ).toBe(400);
  expect(
    (await admin.get(`${base}/performance/metrics`, { params: { ...range, type: 'invalid' } }))
      .status,
  ).toBe(400);
});
