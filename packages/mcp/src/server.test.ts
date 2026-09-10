import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { UmamiClient } from '@umami/api-client';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { McpLogEvent } from './lib/logger';
import { createUmamiMcpServer } from './server';

const WEBSITE_ID = '6f2a7e0e-2b0f-4b3f-9f0a-1234567890ab';
const SESSION_ID = '0b3b6c2e-1f4a-4d0c-9a5e-abcdefabcdef';

type Handler = (url: URL, init?: RequestInit) => { status?: number; body: unknown };

interface Call {
  url: URL;
  init?: RequestInit;
}

function createHarness(handler: Handler) {
  const calls: Call[] = [];
  const logs: McpLogEvent[] = [];
  const umami = new UmamiClient({
    baseUrl: 'https://example.com/api',
    token: 'secret-token',
    fetch: async (input, init) => {
      const url = new URL(input.toString());
      calls.push({ url, init });
      const { status = 200, body } = handler(url, init);

      return new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      });
    },
  });
  const server = createUmamiMcpServer({
    client: umami,
    logger: { info: event => logs.push(event), error: event => logs.push(event) },
  });
  const client = new Client({ name: 'test', version: '0.0.0' });

  return { server, client, calls, logs };
}

async function connect(harness: ReturnType<typeof createHarness>) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await harness.server.connect(serverTransport);
  await harness.client.connect(clientTransport);
}

describe('createUmamiMcpServer', () => {
  let harness: ReturnType<typeof createHarness>;

  const routes: Handler = url => {
    const path = url.pathname;

    if (path === '/api/websites') {
      return {
        body: {
          data: [
            { id: WEBSITE_ID, name: 'Umami', domain: 'umami.is', teamId: null, createdAt: null },
          ],
          count: 1,
          page: 1,
          pageSize: 20,
        },
      };
    }

    if (path === `/api/websites/${WEBSITE_ID}/stats`) {
      return {
        body: {
          pageviews: 100,
          visitors: 40,
          visits: 50,
          bounces: 10,
          totaltime: 5000,
          comparison: { pageviews: 80, visitors: 30, visits: 40, bounces: 8, totaltime: 4000 },
        },
      };
    }

    if (path === `/api/websites/${WEBSITE_ID}/pageviews`) {
      return {
        body: {
          pageviews: [{ x: '2024-01-01', y: 10 }],
          sessions: [{ x: '2024-01-01', y: 5 }],
        },
      };
    }

    if (path === `/api/websites/${WEBSITE_ID}/metrics`) {
      return {
        body: [
          { x: '/', y: 50 },
          { x: '/docs', y: 20 },
        ],
      };
    }

    if (path === `/api/websites/${WEBSITE_ID}/active`) {
      return { body: { visitors: 7 } };
    }

    if (path === `/api/websites/${WEBSITE_ID}/events`) {
      return {
        body: {
          data: [
            {
              id: 'e1',
              sessionId: SESSION_ID,
              createdAt: '2024-01-01T00:00:00.000Z',
              eventName: 'signup',
              eventType: 2,
              urlPath: '/signup',
            },
          ],
          count: 250,
          page: Number(url.searchParams.get('page') ?? 1),
          pageSize: Number(url.searchParams.get('pageSize') ?? 20),
        },
      };
    }

    if (path === `/api/websites/${WEBSITE_ID}/sessions`) {
      return {
        body: {
          data: [{ id: SESSION_ID, browser: 'chrome', firstAt: '2024-01-01T00:00:00.000Z' }],
          count: 1,
          page: 1,
          pageSize: 20,
        },
      };
    }

    if (path === `/api/websites/${WEBSITE_ID}/sessions/${SESSION_ID}`) {
      return {
        body: {
          id: SESSION_ID,
          browser: 'chrome',
          firstAt: '2024-01-01T00:00:00.000Z',
          lastAt: '2024-01-01T01:00:00.000Z',
          visits: 1,
          views: 3,
        },
      };
    }

    if (path === `/api/websites/${WEBSITE_ID}/sessions/${SESSION_ID}/activity`) {
      return {
        body: [
          { createdAt: '2024-01-01T00:00:00.000Z', urlPath: '/', eventType: 1 },
          { createdAt: '2024-01-01T00:01:00.000Z', eventName: 'signup', eventType: 2 },
        ],
      };
    }

    if (path === `/api/websites/${WEBSITE_ID}/sessions/${SESSION_ID}/properties`) {
      return { body: [{ dataKey: 'plan', stringValue: 'pro' }] };
    }

    if (path === `/api/websites/${WEBSITE_ID}/funnels/stats`) {
      return {
        body: [
          {
            type: 'path',
            value: '/',
            visitors: 10,
            previous: 0,
            dropped: 0,
            dropoff: 0,
            remaining: 1,
          },
          {
            type: 'event',
            value: 'signup',
            visitors: 2,
            previous: 10,
            dropped: 8,
            dropoff: 0.8,
            remaining: 0.2,
          },
        ],
      };
    }

    if (path === `/api/websites/${WEBSITE_ID}/revenue/stats`) {
      return {
        body: {
          sum: 100,
          count: 2,
          average: 50,
          unique_count: 2,
          arpu: 50,
          comparison: { sum: 80 },
        },
      };
    }
    if (path === `/api/websites/${WEBSITE_ID}/revenue/chart`) {
      return { body: { chart: [{ t: '2024-01-01', sum: 100 }] } };
    }
    if (path === `/api/websites/${WEBSITE_ID}/revenue/metrics`) {
      return { body: [{ name: url.searchParams.get('type'), value: 100 }] };
    }

    if (path === `/api/websites/${WEBSITE_ID}/daterange`) {
      return {
        body: { startDate: '2023-06-01T00:00:00.000Z', endDate: '2024-01-31T00:00:00.000Z' },
      };
    }

    if (path === `/api/websites/${WEBSITE_ID}/events/stats`) {
      return {
        body: {
          data: {
            events: 30,
            visitors: 12,
            visits: 15,
            uniqueEvents: 3,
            comparison: { events: 20, visitors: 8, visits: 9, uniqueEvents: 2 },
          },
        },
      };
    }

    if (path === `/api/websites/${WEBSITE_ID}/events/series`) {
      return {
        body: [
          { x: 'signup', t: '2024-01-01', y: 4 },
          { x: 'signup', t: '2024-01-02', y: 6 },
          { x: 'checkout', t: '2024-01-01', y: 1 },
        ],
      };
    }

    if (path === `/api/websites/${WEBSITE_ID}/sessions/stats`) {
      return {
        body: {
          pageviews: { value: 100 },
          visitors: { value: 40 },
          visits: { value: 50 },
          countries: { value: 7 },
          events: { value: 30 },
        },
      };
    }

    if (path === `/api/websites/${WEBSITE_ID}/event-data/properties`) {
      return {
        body: [
          { eventName: 'checkout', propertyName: 'plan', dataType: 1, total: 25 },
          { eventName: 'checkout', propertyName: 'amount', dataType: 2, total: 25 },
        ],
      };
    }

    if (path === `/api/websites/${WEBSITE_ID}/event-data/stats`) {
      return { body: { events: 25, properties: 2, records: 50 } };
    }

    if (path === `/api/websites/${WEBSITE_ID}/event-data/values`) {
      return {
        body: [
          { value: 'pro', total: 15 },
          { value: 'free', total: 10 },
        ],
      };
    }

    if (path.startsWith('/api/websites/')) {
      return {
        status: 401,
        body: { error: { message: 'Unauthorized', code: 'unauthorized', status: 401 } },
      };
    }

    return {
      status: 404,
      body: { error: { message: 'Not found', code: 'not-found', status: 404 } },
    };
  };

  beforeEach(async () => {
    harness = createHarness(routes);
    await connect(harness);
  });

  afterEach(async () => {
    await harness.client.close();
    await harness.server.close();
  });

  test('registers the expected read-only tools', async () => {
    const { tools } = await harness.client.listTools();
    const names = tools.map(tool => tool.name).sort();

    expect(names).toEqual(
      [
        'list_websites',
        'get_website_daterange',
        'get_website_stats',
        'get_website_traffic',
        'get_website_metrics',
        'get_realtime',
        'get_events',
        'get_event_stats',
        'get_event_series',
        'get_event_properties',
        'get_sessions',
        'get_session_stats',
        'get_session',
        'run_funnel',
        'run_journey',
        'run_retention',
        'run_attribution',
        'get_revenue',
      ].sort(),
    );

    for (const tool of tools) {
      expect(tool.annotations?.readOnlyHint).toBe(true);
      expect(tool.annotations?.destructiveHint).toBe(false);
      expect(tool.description?.length ?? 0).toBeGreaterThan(40);
    }
  });

  test('list_websites returns structured websites and pagination', async () => {
    const result = await harness.client.callTool({ name: 'list_websites', arguments: {} });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toMatchObject({
      websites: [{ id: WEBSITE_ID, name: 'Umami', domain: 'umami.is' }],
      page: 1,
      count: 1,
      hasMore: false,
    });
    expect(harness.calls[0].url.searchParams.get('includeTeams')).toBe('true');
    expect(
      (harness.calls[0].init?.headers as Record<string, string> | undefined)?.authorization,
    ).toBe('Bearer secret-token');
  });

  test('get_website_stats converts ISO dates to timestamps and summarizes both periods', async () => {
    const result = await harness.client.callTool({
      name: 'get_website_stats',
      arguments: {
        websiteId: WEBSITE_ID,
        startAt: '2024-01-01T00:00:00Z',
        endAt: '2024-01-08T00:00:00Z',
        filters: { browser: 'chrome' },
      },
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toMatchObject({
      current: { pageviews: 100, visitors: 40, visits: 50, bounceRate: 20 },
      previous: { pageviews: 80, visitors: 30 },
    });

    const url = harness.calls[0].url;

    expect(url.searchParams.get('startAt')).toBe(String(Date.parse('2024-01-01T00:00:00Z')));
    expect(url.searchParams.get('endAt')).toBe(String(Date.parse('2024-01-08T00:00:00Z')));
    expect(url.searchParams.get('browser')).toBe('chrome');
  });

  test('rejects invalid date ranges without calling the API', async () => {
    const result = await harness.client.callTool({
      name: 'get_website_stats',
      arguments: { websiteId: WEBSITE_ID, startAt: '2024-02-01', endAt: '2024-01-01' },
    });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toMatchObject({ error: { code: 'invalid_date_range' } });
    expect(harness.calls).toHaveLength(0);
  });

  test('get_website_traffic returns series with friendly keys', async () => {
    const result = await harness.client.callTool({
      name: 'get_website_traffic',
      arguments: { websiteId: WEBSITE_ID, startAt: '2024-01-01', unit: 'day' },
    });

    expect(result.structuredContent).toMatchObject({
      pageviews: [{ date: '2024-01-01', value: 10 }],
      visits: [{ date: '2024-01-01', value: 5 }],
    });
  });

  test('get_website_metrics enforces limits and maps rows', async () => {
    const result = await harness.client.callTool({
      name: 'get_website_metrics',
      arguments: { websiteId: WEBSITE_ID, startAt: '2024-01-01', type: 'path', limit: 500 },
    });

    expect(result.structuredContent).toMatchObject({
      type: 'path',
      measure: 'views',
      data: [
        { name: '/', value: 50 },
        { name: '/docs', value: 20 },
      ],
    });
    expect(harness.calls[0].url.searchParams.get('limit')).toBe('500');

    const tooMany = await harness.client.callTool({
      name: 'get_website_metrics',
      arguments: { websiteId: WEBSITE_ID, startAt: '2024-01-01', type: 'path', limit: 5000 },
    });

    expect(tooMany.isError).toBe(true);
  });

  test('get_realtime returns the active visitor count', async () => {
    const result = await harness.client.callTool({
      name: 'get_realtime',
      arguments: { websiteId: WEBSITE_ID },
    });

    expect(result.structuredContent).toMatchObject({ activeVisitors: 7 });
  });

  test('get_events paginates and clamps page size', async () => {
    const result = await harness.client.callTool({
      name: 'get_events',
      arguments: {
        websiteId: WEBSITE_ID,
        startAt: '2024-01-01',
        event: 'signup',
        page: 2,
        pageSize: 100,
      },
    });

    expect(result.structuredContent).toMatchObject({
      events: [{ name: 'signup', type: 'event', path: '/signup', sessionId: SESSION_ID }],
      page: 2,
      pageSize: 100,
      count: 250,
      hasMore: true,
    });
    expect(harness.calls[0].url.searchParams.get('event')).toBe('signup');
  });

  test('get_sessions and get_session return visitor details', async () => {
    const sessions = await harness.client.callTool({
      name: 'get_sessions',
      arguments: { websiteId: WEBSITE_ID, startAt: '2024-01-01' },
    });

    expect(sessions.structuredContent).toMatchObject({
      sessions: [{ id: SESSION_ID, browser: 'chrome' }],
    });

    const session = await harness.client.callTool({
      name: 'get_session',
      arguments: { websiteId: WEBSITE_ID, sessionId: SESSION_ID },
    });

    expect(session.structuredContent).toMatchObject({
      session: { id: SESSION_ID, views: 3 },
      properties: { plan: 'pro' },
      activity: [
        { type: 'pageview', path: '/' },
        { type: 'event', name: 'signup' },
      ],
    });
  });

  test('get_website_daterange returns the available data window', async () => {
    const result = await harness.client.callTool({
      name: 'get_website_daterange',
      arguments: { websiteId: WEBSITE_ID },
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toMatchObject({
      startAt: '2023-06-01T00:00:00.000Z',
      endAt: '2024-01-31T00:00:00.000Z',
      hasData: true,
    });
  });

  test('get_event_stats summarizes current and previous periods', async () => {
    const result = await harness.client.callTool({
      name: 'get_event_stats',
      arguments: {
        websiteId: WEBSITE_ID,
        startAt: '2024-01-01',
        endAt: '2024-01-08',
        compare: 'yoy',
      },
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toMatchObject({
      current: { events: 30, visitors: 12, visits: 15, uniqueEvents: 3 },
      previous: { events: 20, visitors: 8 },
      compare: 'yoy',
    });
    expect(harness.calls[0].url.searchParams.get('compare')).toBe('yoy');
  });

  test('get_event_series groups rows by event name', async () => {
    const result = await harness.client.callTool({
      name: 'get_event_series',
      arguments: { websiteId: WEBSITE_ID, startAt: '2024-01-01', unit: 'day', limit: 5 },
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toMatchObject({
      unit: 'day',
      events: [
        {
          name: 'signup',
          total: 10,
          series: [
            { date: '2024-01-01', value: 4 },
            { date: '2024-01-02', value: 6 },
          ],
        },
        { name: 'checkout', total: 1 },
      ],
    });
    expect(harness.calls[0].url.searchParams.get('limit')).toBe('5');
  });

  test('get_session_stats unwraps value objects', async () => {
    const result = await harness.client.callTool({
      name: 'get_session_stats',
      arguments: { websiteId: WEBSITE_ID, startAt: '2024-01-01', filters: { country: 'US' } },
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toMatchObject({
      visitors: 40,
      visits: 50,
      pageviews: 100,
      events: 30,
      countries: 7,
    });
    expect(harness.calls[0].url.searchParams.get('country')).toBe('US');
  });

  test('get_event_properties lists properties, then values for one property', async () => {
    const listed = await harness.client.callTool({
      name: 'get_event_properties',
      arguments: { websiteId: WEBSITE_ID, startAt: '2024-01-01', eventName: 'checkout' },
    });

    expect(listed.isError).toBeFalsy();
    expect(listed.structuredContent).toMatchObject({
      eventName: 'checkout',
      totals: { events: 25, properties: 2, records: 50 },
      properties: [
        { eventName: 'checkout', propertyName: 'plan', dataType: 'string', count: 25 },
        { eventName: 'checkout', propertyName: 'amount', dataType: 'number', count: 25 },
      ],
    });
    expect(harness.calls.map(call => call.url.pathname).sort()).toEqual([
      `/api/websites/${WEBSITE_ID}/event-data/properties`,
      `/api/websites/${WEBSITE_ID}/event-data/stats`,
    ]);
    expect(harness.calls[0].url.searchParams.get('event')).toBe('checkout');

    harness.calls.length = 0;

    const values = await harness.client.callTool({
      name: 'get_event_properties',
      arguments: {
        websiteId: WEBSITE_ID,
        startAt: '2024-01-01',
        propertyName: 'plan',
        eventName: 'checkout',
        dataType: 'string',
      },
    });

    expect(values.isError).toBeFalsy();
    expect(values.structuredContent).toMatchObject({
      propertyName: 'plan',
      values: [
        { value: 'pro', count: 15 },
        { value: 'free', count: 10 },
      ],
    });
    expect(harness.calls).toHaveLength(1);
    expect(harness.calls[0].url.pathname).toBe(`/api/websites/${WEBSITE_ID}/event-data/values`);
    expect(harness.calls[0].url.searchParams.get('propertyName')).toBe('plan');
    expect(harness.calls[0].url.searchParams.get('eventName')).toBe('checkout');
    expect(harness.calls[0].url.searchParams.get('dataType')).toBe('1');
  });

  test('run_funnel sends structured criteria with GET', async () => {
    const result = await harness.client.callTool({
      name: 'run_funnel',
      arguments: {
        websiteId: WEBSITE_ID,
        startAt: '2024-01-01',
        endAt: '2024-01-31',
        steps: [
          { type: 'path', value: '/' },
          { type: 'event', value: 'signup' },
        ],
      },
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toMatchObject({
      steps: [
        { step: 1, visitors: 10 },
        { step: 2, visitors: 2, dropped: 8 },
      ],
    });

    const { url, init } = harness.calls[0];
    expect(init?.method).toBe('GET');
    expect(init?.body).toBeUndefined();
    expect(url.pathname).toBe(`/api/websites/${WEBSITE_ID}/funnels/stats`);
    expect(JSON.parse(url.searchParams.get('steps') ?? 'null')).toHaveLength(2);
    expect(url.searchParams.get('window')).toBe('60');
    expect(Number(url.searchParams.get('startAt'))).toBeGreaterThan(0);
  });

  test('get_revenue composes feature APIs without changing its tool output', async () => {
    const result = await harness.client.callTool({
      name: 'get_revenue',
      arguments: {
        websiteId: WEBSITE_ID,
        startAt: '2024-01-01',
        endAt: '2024-01-31',
        currency: 'eur',
        filters: { browser: 'Chrome' },
      },
    });
    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toMatchObject({
      currency: 'EUR',
      total: { sum: 100, comparison: { sum: 80 } },
      chart: [{ sum: 100 }],
      byCountry: [{ name: 'country', value: 100 }],
      byRegion: [{ name: 'region' }],
      byReferrer: [{ name: 'referrer' }],
      byChannel: [{ name: 'channel' }],
    });
    expect(harness.calls).toHaveLength(6);
    for (const { url, init } of harness.calls) {
      expect(init?.method).toBe('GET');
      expect(url.pathname).toContain(`/websites/${WEBSITE_ID}/revenue/`);
      expect(url.searchParams.get('currency')).toBe('EUR');
      expect(url.searchParams.get('startAt')).toBe(String(Date.parse('2024-01-01')));
    }
  });

  test('maps unauthorized website access to a helpful error', async () => {
    const otherWebsite = '11111111-2222-4333-8444-555555555555';
    const result = await harness.client.callTool({
      name: 'get_realtime',
      arguments: { websiteId: otherWebsite },
    });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toMatchObject({
      error: { code: 'access_denied', status: 401 },
    });
    expect((result.content[0] as { text: string }).text).toContain(otherWebsite);
    expect((result.content[0] as { text: string }).text).not.toContain('secret-token');
  });

  test('logs tool calls without leaking tokens', async () => {
    await harness.client.callTool({ name: 'list_websites', arguments: {} });

    expect(harness.logs).toHaveLength(1);
    expect(harness.logs[0]).toMatchObject({ event: 'tool_call', tool: 'list_websites', ok: true });
    expect(JSON.stringify(harness.logs)).not.toContain('secret-token');
  });
});
