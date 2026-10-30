import { z } from 'zod';
import { defineOperation } from '@/openapi/operation';
import { jsonResponse, notFoundResponse, unauthorizedResponse } from '@/openapi/schemas';

const securityKeySchema = z
  .object({
    id: z.string().describe('Unique identifier of the resource.'),
    name: z.string().describe('Display name of the resource.'),
    lastUsedAt: z.iso
      .datetime()
      .nullable()
      .describe('Date and time the credential was last used. Null until the key is first used.'),
    createdAt: z.iso.datetime().describe('Date and time the record was created.'),
  })
  .meta({ id: 'SecurityKey' });

const getSecurityKeysOperation = defineOperation({
  method: 'get',
  path: '/api/2fa/security-keys',
  audience: 'public',
  auth: 'bearer',
  operation: {
    operationId: 'getSecurityKeys',
    summary: 'List security keys',
    description: 'Returns the security keys the current user has registered as a second factor.',
    tags: ['Two-factor authentication'],
    responses: {
      '200': jsonResponse(z.array(securityKeySchema), 'The operation completed successfully.'),
      '401': unauthorizedResponse,
      '404': notFoundResponse,
    },
  },
});

export const operations = [getSecurityKeysOperation] as const;
