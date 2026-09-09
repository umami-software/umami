import { uuid } from '@/lib/crypto';
import { isDynamicRegistrationEnabled } from '@/lib/oauth/config';
import { OAuthError, oauthErrorResponse, oauthJson } from '@/lib/oauth/errors';
import { corsPreflight } from '@/lib/oauth/metadata';
import { isAcceptableRedirectUri } from '@/lib/oauth/redirect';
import { parseRequest } from '@/lib/request';
import { notFound } from '@/lib/response';
import { createOauthClient } from '@/queries/prisma/oauth';
import { clientRegistrationRequestSchema } from '../schema';

export function OPTIONS() {
  return corsPreflight();
}

/**
 * Dynamic Client Registration (RFC 7591) compatibility endpoint for MCP clients that do not yet
 * support Client ID Metadata Documents. Public clients only; opt in with OAUTH_DCR_ENABLED=1.
 */
export async function POST(request: Request) {
  if (!isDynamicRegistrationEnabled()) {
    return notFound();
  }

  const { body, error } = await parseRequest(request, clientRegistrationRequestSchema, {
    skipAuth: true,
  });

  if (error) {
    return oauthJson(
      { error: 'invalid_client_metadata', error_description: 'Invalid registration request.' },
      { status: 400 },
    );
  }

  try {
    if (!body.redirect_uris.every(isAcceptableRedirectUri)) {
      throw new OAuthError(
        'invalid_redirect_uri',
        'redirect_uris must be absolute https, loopback http or custom-scheme URLs without fragments.',
      );
    }

    const grantTypes = body.grant_types ?? ['authorization_code', 'refresh_token'];
    const responseTypes = body.response_types ?? ['code'];

    if (grantTypes.some(type => !['authorization_code', 'refresh_token'].includes(type))) {
      throw new OAuthError('invalid_client_metadata', 'Unsupported grant_types.');
    }

    if (responseTypes.some(type => type !== 'code')) {
      throw new OAuthError('invalid_client_metadata', 'Unsupported response_types.');
    }

    const id = uuid();
    const metadata = {
      client_uri: body.client_uri,
      logo_uri: body.logo_uri,
      application_type: body.application_type,
      software_id: body.software_id,
      software_version: body.software_version,
      scope: body.scope,
    };

    const client = await createOauthClient({
      id,
      name: body.client_name,
      redirectUris: body.redirect_uris,
      metadata,
    });

    return oauthJson(
      {
        client_id: client.id,
        client_id_issued_at: Math.floor((client.createdAt ?? new Date()).getTime() / 1000),
        client_name: client.name,
        redirect_uris: body.redirect_uris,
        token_endpoint_auth_method: 'none',
        grant_types: grantTypes,
        response_types: responseTypes,
        ...(body.client_uri ? { client_uri: body.client_uri } : {}),
        ...(body.logo_uri ? { logo_uri: body.logo_uri } : {}),
        ...(body.application_type ? { application_type: body.application_type } : {}),
        ...(body.scope ? { scope: body.scope } : {}),
      },
      { status: 201 },
    );
  } catch (err) {
    return oauthErrorResponse(err);
  }
}
