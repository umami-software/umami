import { UmamiClient } from '@umami/api-client';
import type { McpLogger } from '@umami/mcp';
import { createUmamiMcpHttpHandler } from '@umami/mcp';
import debug from 'debug';
import { uuid } from '@/lib/crypto';
import { authenticateMcpRequest, mcpAuthErrorResponse } from '@/lib/mcp/auth';
import { createInProcessFetch } from '@/lib/mcp/dispatch';
import { checkMcpRateLimit } from '@/lib/mcp/rate-limit';
import { getIssuer, isOAuthEnabled } from '@/lib/oauth/config';
import { corsPreflight } from '@/lib/oauth/metadata';

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
    const issuer = getIssuer(ctx.requestInfo?.headers);

    return new UmamiClient({
      baseUrl: `${issuer}/api`,
      token: authInfo.token,
      fetch: createInProcessFetch(),
    });
  },
});

async function handle(request: Request) {
  if (!isOAuthEnabled() && process.env.MCP_DISABLED === '1') {
    return new Response(null, { status: 404 });
  }

  const auth = await authenticateMcpRequest(request);

  if (!auth.ok) {
    return mcpAuthErrorResponse(auth, request.headers);
  }

  if (!(await checkMcpRateLimit(auth.userId, auth.authInfo.clientId))) {
    return Response.json(
      { error: 'rate_limited', error_description: 'Too many MCP requests. Slow down.' },
      { status: 429, headers: { 'retry-after': '60' } },
    );
  }

  const requestId = uuid();
  const authInfo = { ...auth.authInfo, extra: { ...auth.authInfo.extra, requestId } };

  return handler.fetch(request, { authInfo });
}

export function OPTIONS() {
  return corsPreflight();
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
