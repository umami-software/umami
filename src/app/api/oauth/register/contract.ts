import { defineOperation } from '@/openapi/operation';
import { jsonResponse } from '@/openapi/schemas';
import {
  clientRegistrationRequestSchema,
  clientRegistrationResponseSchema,
  oauthErrorSchema,
} from '../schema';

const registerOperation = defineOperation({
  method: 'post',
  path: '/api/oauth/register',
  audience: 'internal',
  auth: 'none',
  operation: {
    operationId: 'oauthRegisterClient',
    summary: 'Register an OAuth client (dynamic client registration)',
    description:
      'RFC 7591 compatibility endpoint for MCP clients without Client ID Metadata Document support. Registers a public client. Prefer Client ID Metadata Documents (https URL client_id).',
    tags: ['OAuth'],
    requestBody: {
      required: true,
      content: { 'application/json': { schema: clientRegistrationRequestSchema } },
    },
    responses: {
      '201': jsonResponse(clientRegistrationResponseSchema, 'Registered client.'),
      '400': jsonResponse(oauthErrorSchema, 'Invalid client metadata.'),
    },
  },
});

export const operations = [registerOperation] as const;
