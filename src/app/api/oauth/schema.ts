import { z } from 'zod';

export const authorizationRequestSchema = z
  .object({
    response_type: z.string().optional(),
    client_id: z.string().max(2048),
    redirect_uri: z.string().max(2048).optional(),
    scope: z.string().max(500).optional(),
    state: z.string().max(1024).optional(),
    code_challenge: z.string().max(128).optional(),
    code_challenge_method: z.string().max(10).optional(),
    resource: z.string().max(2048).optional(),
  })
  .meta({ id: 'OAuthAuthorizationRequest' });

export const authorizationDecisionSchema = authorizationRequestSchema
  .extend({
    decision: z.enum(['approve', 'deny']),
  })
  .meta({ id: 'OAuthAuthorizationDecision' });

export const authorizationDetailsSchema = z
  .object({
    client: z.object({
      id: z.string(),
      name: z.string(),
      uri: z.string().optional(),
      logoUri: z.string().optional(),
      source: z.enum(['metadata-document', 'registered']),
    }),
    scopes: z.array(z.object({ scope: z.string(), description: z.string() })),
    redirectUri: z.string(),
    resource: z.string(),
  })
  .meta({ id: 'OAuthAuthorizationDetails' });

export const authorizationRedirectSchema = z
  .object({ redirectUrl: z.string() })
  .meta({ id: 'OAuthAuthorizationRedirect' });

export const tokenRequestSchema = z
  .object({
    grant_type: z.enum(['authorization_code', 'refresh_token']),
    code: z.string().optional(),
    redirect_uri: z.string().optional(),
    client_id: z.string().optional(),
    code_verifier: z.string().optional(),
    refresh_token: z.string().optional(),
    scope: z.string().optional(),
    resource: z.string().optional(),
  })
  .meta({ id: 'OAuthTokenRequest' });

export const tokenResponseSchema = z
  .object({
    access_token: z.string(),
    token_type: z.literal('Bearer'),
    expires_in: z.number().int(),
    refresh_token: z.string(),
    scope: z.string(),
  })
  .meta({ id: 'OAuthTokenResponse' });

export const oauthErrorSchema = z
  .object({
    error: z.string(),
    error_description: z.string().optional(),
  })
  .meta({ id: 'OAuthErrorResponse' });

export const revocationRequestSchema = z
  .object({
    token: z.string(),
    token_type_hint: z.string().optional(),
  })
  .meta({ id: 'OAuthRevocationRequest' });

export const clientRegistrationRequestSchema = z
  .object({
    redirect_uris: z.array(z.string().max(2048)).min(1).max(20),
    client_name: z.string().trim().min(1).max(255),
    client_uri: z.string().max(2048).optional(),
    logo_uri: z.string().max(2048).optional(),
    token_endpoint_auth_method: z.literal('none').optional(),
    grant_types: z.array(z.string()).optional(),
    response_types: z.array(z.string()).optional(),
    application_type: z.enum(['web', 'native']).optional(),
    scope: z.string().max(500).optional(),
    software_id: z.string().max(255).optional(),
    software_version: z.string().max(255).optional(),
  })
  .meta({ id: 'OAuthClientRegistrationRequest' });

export const clientRegistrationResponseSchema = clientRegistrationRequestSchema
  .extend({
    client_id: z.string(),
    client_id_issued_at: z.number().int(),
    token_endpoint_auth_method: z.literal('none'),
    grant_types: z.array(z.string()),
    response_types: z.array(z.string()),
  })
  .meta({ id: 'OAuthClientRegistrationResponse' });
