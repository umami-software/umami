import {
  buildErrorRedirect,
  buildSuccessRedirect,
  issueAuthorizationCode,
  validateAuthorizationRequest,
} from '@/lib/oauth/authorize';
import { getIssuer, isOAuthEnabled } from '@/lib/oauth/config';
import { OAuthError, oauthErrorResponse } from '@/lib/oauth/errors';
import { OAUTH_SCOPE_DESCRIPTIONS } from '@/lib/oauth/scopes';
import { parseRequest } from '@/lib/request';
import { json, notFound, unauthorized } from '@/lib/response';
import { authorizationDecisionSchema, authorizationRequestSchema } from '../schema';

function requireSession(auth: { user?: { id: string }; authType?: string } | null) {
  // Only an interactive user session may grant consent: never an API key or another OAuth token.
  return !!auth?.user?.id && (auth.authType === undefined || auth.authType === 'session');
}

/**
 * Describes a pending authorization request for the consent screen. Validation errors are
 * returned as JSON (the consent UI renders them) — no redirect happens until the user decides.
 */
export async function GET(request: Request) {
  if (!isOAuthEnabled()) {
    return notFound();
  }

  const { auth, query, error } = await parseRequest(request, authorizationRequestSchema);

  if (error) {
    return error();
  }

  if (!requireSession(auth)) {
    return unauthorized();
  }

  try {
    const validated = await validateAuthorizationRequest(query, getIssuer(request.headers));

    return json({
      client: {
        id: validated.client.clientId,
        name: validated.client.clientName,
        uri: validated.client.clientUri,
        logoUri: validated.client.logoUri,
        source: validated.client.source,
      },
      scopes: validated.scopes.map(scope => ({
        scope,
        description: OAUTH_SCOPE_DESCRIPTIONS[scope],
      })),
      redirectUri: validated.redirectUri,
      resource: validated.resource,
    });
  } catch (err) {
    return oauthErrorResponse(err);
  }
}

/** Records the user's decision and returns the redirect URL the browser should navigate to. */
export async function POST(request: Request) {
  if (!isOAuthEnabled()) {
    return notFound();
  }

  const { auth, body, error } = await parseRequest(request, authorizationDecisionSchema);

  if (error) {
    return error();
  }

  if (!requireSession(auth)) {
    return unauthorized();
  }

  const issuer = getIssuer(request.headers);
  const { decision, ...params } = body;

  try {
    const validated = await validateAuthorizationRequest(params, issuer);

    if (decision !== 'approve') {
      return json({
        redirectUrl: buildErrorRedirect(
          validated.redirectUri,
          new OAuthError('access_denied', 'The user denied the request.'),
          validated.state,
          issuer,
        ),
      });
    }

    const code = await issueAuthorizationCode(validated, auth.user.id);

    return json({ redirectUrl: buildSuccessRedirect(validated, code, issuer) });
  } catch (err) {
    return oauthErrorResponse(err);
  }
}
