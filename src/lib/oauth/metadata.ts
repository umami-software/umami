import { getOAuthEndpoints } from '@/lib/oauth/config';
import { OAUTH_SCOPES } from '@/lib/oauth/scopes';

/** RFC 8414 Authorization Server Metadata. */
export function buildAuthorizationServerMetadata(headers?: Pick<Headers, 'get'>) {
  const endpoints = getOAuthEndpoints(headers);

  return {
    issuer: endpoints.issuer,
    authorization_endpoint: endpoints.authorizationEndpoint,
    token_endpoint: endpoints.tokenEndpoint,
    revocation_endpoint: endpoints.revocationEndpoint,
    ...(endpoints.registrationEndpoint
      ? { registration_endpoint: endpoints.registrationEndpoint }
      : {}),
    response_types_supported: ['code'],
    response_modes_supported: ['query'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    revocation_endpoint_auth_methods_supported: ['none'],
    scopes_supported: [...OAUTH_SCOPES],
    authorization_response_iss_parameter_supported: true,
    client_id_metadata_document_supported: true,
    service_documentation: 'https://umami.is/docs/mcp',
  };
}

/** RFC 9728 Protected Resource Metadata for the embedded MCP server. */
export function buildProtectedResourceMetadata(headers?: Pick<Headers, 'get'>) {
  const endpoints = getOAuthEndpoints(headers);

  return {
    resource: endpoints.resource,
    resource_name: 'Umami MCP',
    authorization_servers: [endpoints.issuer],
    scopes_supported: [...OAUTH_SCOPES],
    bearer_methods_supported: ['header'],
    resource_documentation: 'https://umami.is/docs/mcp',
  };
}

export function metadataResponse(body: unknown) {
  return Response.json(body, {
    headers: {
      'cache-control': 'public, max-age=300',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': '*',
    },
  });
}

export function corsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': '*',
      'access-control-max-age': '86400',
    },
  });
}
