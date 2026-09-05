import { isOAuthEnabled } from '@/lib/oauth/config';
import { oauthErrorResponse, oauthJson } from '@/lib/oauth/errors';
import { readOAuthBody } from '@/lib/oauth/form';
import { corsPreflight } from '@/lib/oauth/metadata';
import { handleRevocationRequest } from '@/lib/oauth/token';
import { notFound } from '@/lib/response';

export function OPTIONS() {
  return corsPreflight();
}

/** RFC 7009 token revocation. Always returns 200 for well-formed requests. */
export async function POST(request: Request) {
  if (!isOAuthEnabled()) {
    return notFound();
  }

  try {
    const params = await readOAuthBody(request);

    if (typeof params.token !== 'string' || !params.token) {
      return oauthJson(
        { error: 'invalid_request', error_description: 'token is required.' },
        { status: 400 },
      );
    }

    await handleRevocationRequest(params);

    return oauthJson({});
  } catch (error) {
    return oauthErrorResponse(error);
  }
}
