import { UmamiClient } from '@umami/api-client';
import type { CreateUmamiMcpHttpHandlerOptions, McpLogger } from '@umami/mcp';
import { createUmamiMcpHttpHandler } from '@umami/mcp';
import debug from 'debug';
import { uuid } from '@/lib/crypto';
import { getBaseUrl } from '@/lib/get-base-url';
import { authenticateMcpRequest, mcpAuthErrorResponse } from '@/lib/mcp/auth';
import { createInProcessFetch } from '@/lib/mcp/dispatch';

export const dynamic = 'force-dynamic';

const log = debug('umami:mcp');

const logger: McpLogger = {
  info: event => log('%j', event),
  error: event => log('%j', event),
};

/**
 * Remote MCP endpoint (Streamable HTTP, protocol revision 2026-07-28, stateless).
 *
 * Request path: MCP client → bearer token → @umami/mcp → @umami/api-client → in-process API
 * route handlers → existing user/team authorization. MCP never touches storage directly.
 */
const handler = createUmamiMcpHttpHandler({
  logger,
  onerror: error => log('handler error: %s', error?.message),
  createClient: (authInfo, ctx) => {
    const baseUrl = getBaseUrl(ctx.requestInfo?.headers).toString().replace(/\/+$/, '');
    const basePath = (process.env.BASE_PATH ?? '').replace(/\/+$/, '');

    // @umami/mcp resolves its declared api-client dependency independently.
    // Both copies use the same public client API, but TypeScript treats their
    // private fetch implementation fields as incompatible.
    return new UmamiClient({
      baseUrl: `${baseUrl}${basePath}/api`,
      token: authInfo.token,
      fetch: createInProcessFetch(),
    }) as unknown as Awaited<ReturnType<CreateUmamiMcpHttpHandlerOptions['createClient']>>;
  },
});

async function handle(request: Request) {
  if (process.env.MCP_ENABLED !== '1') {
    return new Response(null, { status: 404 });
  }

  const auth = await authenticateMcpRequest(request);

  if (!auth.ok) {
    return mcpAuthErrorResponse(auth);
  }

  const requestId = uuid();
  const authInfo = { ...auth.authInfo, extra: { ...auth.authInfo.extra, requestId } };

  return handler.fetch(request, { authInfo });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
      'access-control-allow-headers': '*',
      'access-control-max-age': '86400',
    },
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

export async function DELETE(request: Request) {
  return handle(request);
}
