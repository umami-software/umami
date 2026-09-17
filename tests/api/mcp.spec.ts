import type { ApiClient } from './client';
import { expect, test } from './fixtures';
import { dateRange } from './helpers/dates';

const headers = {
  accept: 'application/json, text/event-stream',
  'mcp-protocol-version': '2026-07-28',
};

async function rpc(client: ApiClient, method: string, params: Record<string, unknown> = {}) {
  const legacy = method === 'initialize';
  const response = await client
    .with({
      ...headers,
      'mcp-method': method,
      ...(typeof params.name === 'string' ? { 'mcp-name': params.name } : {}),
      'mcp-protocol-version': legacy ? '2025-11-25' : '2026-07-28',
    })
    .post('/mcp', {
      jsonrpc: '2.0',
      id: 1,
      method,
      params: legacy
        ? params
        : {
            ...params,
            _meta: {
              'io.modelcontextprotocol/protocolVersion': '2026-07-28',
              'io.modelcontextprotocol/clientInfo': {
                name: 'umami-integration-test',
                version: '1.0.0',
              },
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
    });
  expect(response.status, response.text).toBe(200);
  // The transport may return JSON or an SSE message containing the JSON-RPC response.
  const body =
    response.body ??
    response.text
      .split('\n')
      .filter(line => line.startsWith('data:'))
      .map(line => JSON.parse(line.slice(5)))
      .find(message => message.id === 1);
  expect(body?.error).toBeUndefined();
  expect(body?.id).toBe(1);
  return body.result;
}

test.describe('MCP API-key authentication', () => {
  test('rejects anonymous, invalid-key and browser-session callers without OAuth discovery', async ({
    api,
    tokens,
  }) => {
    for (const client of [api, api.bearer('umami_invalid'), api.bearer(tokens.admin)]) {
      const response = await client.with(headers).post('/mcp', {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      });
      expect(response.status).toBe(401);
      expect(response.headers['www-authenticate']).toContain('Bearer realm="Umami MCP"');
      expect(response.headers['www-authenticate']).not.toContain('resource_metadata');
    }
  });

  test('initializes, lists read-only tools and queries seeded analytics with an API key', async ({
    apiKey,
    seed,
  }) => {
    const initialized = await rpc(apiKey, 'initialize', {
      protocolVersion: '2025-11-25',
      capabilities: {},
      clientInfo: { name: 'umami-integration-test', version: '1.0.0' },
    });
    expect(initialized.serverInfo.name).toBeTruthy();
    const { tools } = await rpc(apiKey, 'tools/list');
    expect(tools.map(tool => tool.name)).toContain('list_websites');
    expect(tools.map(tool => tool.name)).toContain('get_website_stats');
    expect(tools.every(tool => tool.annotations?.readOnlyHint === true)).toBe(true);

    const websites = await rpc(apiKey, 'tools/call', { name: 'list_websites', arguments: {} });
    expect(websites.isError).not.toBe(true);
    expect(websites.structuredContent.websites.map(website => website.id)).toContain(
      seed.website.id,
    );

    const stats = await rpc(apiKey, 'tools/call', {
      name: 'get_website_stats',
      arguments: {
        websiteId: seed.website.id,
        startAt: new Date(seed.range.startAt).toISOString(),
        endAt: new Date(dateRange(seed).endAt).toISOString(),
      },
    });
    expect(stats.isError).not.toBe(true);
    expect(stats.structuredContent.current.pageviews).toBeGreaterThanOrEqual(
      seed.data.expectedPageviews,
    );
  });

  test('enforces key-owner permissions and rejects a revoked key', async ({ api, user, seed }) => {
    const created = await user.post('/api/me/api-keys', { name: 'mcp-integration-permissions' });
    expect(created.status).toBe(200);
    const keyClient = api.bearer(created.body.key);
    try {
      const argumentsFor = (websiteId: string) => ({
        websiteId,
        startAt: new Date(seed.range.startAt).toISOString(),
        endAt: new Date(dateRange(seed).endAt).toISOString(),
      });
      const own = await rpc(keyClient, 'tools/call', {
        name: 'get_website_stats',
        arguments: argumentsFor(seed.website2.id),
      });
      expect(own.isError).not.toBe(true);
      expect(own.structuredContent.current.pageviews).toBeGreaterThanOrEqual(
        seed.data.expectedWebsite2Pageviews,
      );
      const denied = await rpc(keyClient, 'tools/call', {
        name: 'get_website_stats',
        arguments: argumentsFor(seed.website.id),
      });
      expect(denied.isError).toBe(true);
      expect(denied.structuredContent.error).toMatchObject({ code: 'access_denied', status: 401 });
    } finally {
      expect((await user.del(`/api/me/api-keys/${created.body.id}`)).status).toBe(200);
    }
    const revoked = await keyClient.with(headers).post('/mcp', {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {},
    });
    expect(revoked.status).toBe(401);
  });
});
