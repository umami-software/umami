import { defineOperation } from '@/openapi/operation';
import { jsonResponse } from '@/openapi/schemas';
import { oauthErrorSchema, tokenRequestSchema, tokenResponseSchema } from '../schema';

const tokenOperation = defineOperation({
  method: 'post',
  path: '/api/oauth/token',
  audience: 'internal',
  auth: 'none',
  operation: {
    operationId: 'oauthToken',
    summary: 'OAuth 2.1 token endpoint',
    description:
      'Exchanges an authorization code (with PKCE code_verifier) or a refresh token for an access token. Accepts application/x-www-form-urlencoded or JSON. Refresh tokens are rotated on every use.',
    tags: ['OAuth'],
    requestBody: {
      required: true,
      content: {
        'application/x-www-form-urlencoded': { schema: tokenRequestSchema },
        'application/json': { schema: tokenRequestSchema },
      },
    },
    responses: {
      '200': jsonResponse(tokenResponseSchema, 'Access and refresh tokens.'),
      '400': jsonResponse(oauthErrorSchema, 'Invalid grant or request.'),
      '401': jsonResponse(oauthErrorSchema, 'Invalid client.'),
    },
  },
});

export const operations = [tokenOperation] as const;
