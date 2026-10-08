import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { UmamiClient as PublishedClient } from '@umami/api-client';
import { describe, expect, test } from 'vitest';
// The commerce operations ship in the workspace API client before they are published.
import { UmamiClient as WorkspaceClient } from '../../../api-client/src/index';
import { createUmamiMcpServer } from '../server';

const WEBSITE_ID = '6f2a7e0e-2b0f-4b3f-9f0a-1234567890ab';

const stats = { revenue: 137, orders: 3, buyers: 2, conversionRate: 0.5 };

function route(url: URL): unknown {
  const path = url.pathname.replace(`/api/websites/${WEBSITE_ID}/commerce/`, '');

  switch (path) {
    case 'currencies':
      return [
        { currency: 'EUR', orders: 3, revenue: 137 },
        { currency: 'USD', orders: 1, revenue: 10 },
      ];
    case 'stats':
      return { ...stats, comparison: { ...stats, revenue: 100 } };
    case 'chart':
      return { chart: [{ x: 'bought-online', t: '2026-09-10', y: 82, count: 1 }] };
    case 'metrics':
      return [{ name: url.searchParams.get('type'), revenue: 82, orders: 1, buyers: 1 }];
    case 'customers':
      return { buyers: 2, newBuyers: 1 };
    case 'attribution':
      return { model: 'last-click', lookbackDays: 30, channel: [], referrer: [], total: {} };
    default:
      return {};
  }
}

async function connect(Client_: typeof WorkspaceClient | typeof PublishedClient) {
  const calls: URL[] = [];
  const umami = new Client_({
    baseUrl: 'https://example.com/api',
    token: 'secret-token',
    fetch: async input => {
      const url = new URL(input.toString());
      calls.push(url);

      return new Response(JSON.stringify(route(url)), {
        headers: { 'content-type': 'application/json' },
      });
    },
  });
  const server = createUmamiMcpServer({
    client: umami as PublishedClient,
    logger: { info: () => {}, error: () => {} },
  });
  const client = new Client({ name: 'test', version: '0.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await server.connect(serverTransport);
  await client.connect(clientTransport);

  return { client, calls };
}

describe('commerce tools', () => {
  test('get_commerce defaults to the currency with the most orders', async () => {
    const { client, calls } = await connect(WorkspaceClient);
    const result = await client.callTool({
      name: 'get_commerce',
      arguments: { websiteId: WEBSITE_ID, startAt: '2026-09-01', endAt: '2026-09-30' },
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toMatchObject({
      currency: 'EUR',
      total: { revenue: 137, comparison: { revenue: 100 } },
      chart: [{ y: 82 }],
      byChannel: [{ name: 'channel' }],
      byMarket: [{ name: 'market' }],
      customers: { newBuyers: 1 },
      attribution: { model: 'last-click' },
    });

    const reports = calls.filter(url => !url.pathname.endsWith('/currencies'));
    expect(reports.length).toBeGreaterThan(0);
    for (const url of reports) {
      expect(url.searchParams.get('currency')).toBe('EUR');
      expect(url.searchParams.get('startAt')).toBe(String(Date.parse('2026-09-01')));
    }
  });

  test('explains when the API client predates commerce reports', async () => {
    const legacy = new PublishedClient({ baseUrl: 'https://example.com/api', token: 'x' });

    if (typeof (legacy as any).getWebsiteCommerceStats === 'function') {
      return;
    }

    const { client } = await connect(PublishedClient);
    const result = await client.callTool({
      name: 'get_commerce',
      arguments: { websiteId: WEBSITE_ID, startAt: '2026-09-01' },
    });

    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('commerce');
  });
});
