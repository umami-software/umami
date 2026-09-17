import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { authenticateMcpRequest } from '@/lib/mcp/auth';
import { DELETE, GET, POST } from './route';

vi.mock('@umami/mcp', () => ({
  createUmamiMcpHttpHandler: () => ({ fetch: vi.fn() }),
}));
vi.mock('@/lib/mcp/auth', () => ({
  authenticateMcpRequest: vi.fn(),
  mcpAuthErrorResponse: () => new Response(null, { status: 401 }),
}));

beforeEach(() => {
  vi.mocked(authenticateMcpRequest).mockReset();
  vi.mocked(authenticateMcpRequest).mockResolvedValue({
    ok: false,
    status: 401,
    error: 'invalid_request',
    description: 'Missing bearer API key.',
  });
});

afterEach(() => vi.unstubAllEnvs());

test.each([undefined, '', '0', 'true'])('MCP stays disabled for MCP_ENABLED=%s', async value => {
  vi.stubEnv('MCP_ENABLED', value);
  for (const handler of [GET, POST, DELETE]) {
    const response = await handler(new Request('http://localhost/mcp'));
    expect(response.status).toBe(404);
  }
  expect(authenticateMcpRequest).not.toHaveBeenCalled();
});

test('MCP_ENABLED=1 enables API-key authentication', async () => {
  vi.stubEnv('MCP_ENABLED', '1');
  const request = new Request('http://localhost/mcp');
  const response = await POST(request);
  expect(response.status).toBe(401);
  expect(authenticateMcpRequest).toHaveBeenCalledWith(request);
});
