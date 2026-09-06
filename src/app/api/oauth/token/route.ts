import { getIssuer, isOAuthEnabled } from '@/lib/oauth/config';
import { oauthErrorResponse, oauthJson } from '@/lib/oauth/errors';
import { readOAuthBody } from '@/lib/oauth/form';
import { corsPreflight } from '@/lib/oauth/metadata';
import { handleTokenRequest } from '@/lib/oauth/token';
import { notFound } from '@/lib/response';

export function OPTIONS() {
  return corsPreflight();
}

/** OAuth 2.1 token endpoint: authorization_code (PKCE) and refresh_token grants. */
export async function POST(request: Request) {
  if (!isOAuthEnabled()) {
    return notFound();
  }

  try {
    const params = await readOAuthBody(request);
    const tokens = await handleTokenRequest(params, getIssuer(request.headers));

    return oauthJson(tokens);
  } catch (error) {
    return oauthErrorResponse(error);
  }
}
