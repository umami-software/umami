import type { AuthInfo } from '@umami/mcp';
import { isApiKey, isApiKeyEnabled } from '@/lib/api-key';
import { checkApiKeyAuth, getBearerToken } from '@/lib/auth';

export type McpAuthResult =
  | { ok: true; authInfo: AuthInfo; userId: string }
  | { ok: false; status: 401; error: string; description: string };

/** The embedded MCP endpoint accepts self-hosted API keys only. */
export async function authenticateMcpRequest(request: Request): Promise<McpAuthResult> {
  const token = getBearerToken(request);

  if (!token) {
    return {
      ok: false,
      status: 401,
      error: 'invalid_request',
      description: 'Missing bearer API key.',
    };
  }

  if (!isApiKeyEnabled() || !isApiKey(token)) {
    return { ok: false, status: 401, error: 'invalid_token', description: 'Invalid API key.' };
  }

  const auth = await checkApiKeyAuth(request, token);

  if (!auth?.user?.id) {
    return { ok: false, status: 401, error: 'invalid_token', description: 'Invalid API key.' };
  }

  return {
    ok: true,
    userId: auth.user.id,
    authInfo: {
      token,
      clientId: `api-key:${auth.apiKey.id}`,
      scopes: [],
      extra: { userId: auth.user.id, authType: 'api-key' },
    },
  };
}

export function mcpAuthErrorResponse(result: McpAuthResult) {
  if (result.ok) {
    throw new Error('mcpAuthErrorResponse called with a successful result.');
  }

  const failure = result as Extract<McpAuthResult, { ok: false }>;

  return Response.json(
    { error: failure.error, error_description: failure.description },
    {
      status: failure.status,
      headers: {
        'www-authenticate': `Bearer realm="Umami MCP", error="${failure.error}"`,
        'cache-control': 'no-store',
      },
    },
  );
}
