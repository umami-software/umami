import { z } from 'zod';
import { defineOperation } from '@/openapi/operation';
import { jsonResponse } from '@/openapi/schemas';
import { oauthErrorSchema, revocationRequestSchema } from '../schema';

const revokeOperation = defineOperation({
  method: 'post',
  path: '/api/oauth/revoke',
  audience: 'internal',
  auth: 'none',
  operation: {
    operationId: 'oauthRevoke',
    summary: 'Revoke an OAuth refresh token',
    description:
      'RFC 7009 revocation endpoint. Revokes the given refresh token; unknown tokens are accepted silently.',
    tags: ['OAuth'],
    requestBody: {
      required: true,
      content: {
        'application/x-www-form-urlencoded': { schema: revocationRequestSchema },
        'application/json': { schema: revocationRequestSchema },
      },
    },
    responses: {
      '200': jsonResponse(z.object({}), 'Token revoked (or already invalid).'),
      '400': jsonResponse(oauthErrorSchema, 'Malformed request.'),
    },
  },
});

export const operations = [revokeOperation] as const;
