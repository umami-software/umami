// Analytics and errors share the collection endpoint and routing configuration.
import { z } from 'zod';
import { defineOperation } from '@/openapi/operation';
import { apiErrorSchema, jsonResponse } from '@/openapi/schemas';
import { collectionSchema } from './request-schema';

export const operations = [
  defineOperation({
    method: 'post',
    path: '/api/send',
    audience: 'collect',
    auth: 'none',
    operation: {
      operationId: 'send',
      summary: 'Collect analytics events, identity, performance, and browser errors',
      tags: ['Collection'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: collectionSchema,
          },
        },
      },
      responses: {
        '200': jsonResponse(
          z.union([
            z.object({ beep: z.string() }),
            z.object({ cache: z.string(), sessionId: z.string(), visitId: z.string() }),
            z.object({
              ok: z.literal(true),
              eventId: z.uuid(),
              issueId: z.uuid(),
              cache: z.string(),
            }),
            z.object({ ok: z.literal(false), reason: z.enum(['errors_disabled', 'bot']) }),
          ]),
        ),
        '400': jsonResponse(apiErrorSchema, 'Invalid collection payload or session token.'),
        '403': jsonResponse(apiErrorSchema, 'Collection blocked.'),
        '413': jsonResponse(apiErrorSchema, 'Error payload exceeds 48,000 bytes.'),
        '429': {
          ...jsonResponse(apiErrorSchema, 'Website error collection quota exceeded.'),
          headers: { 'Retry-After': { schema: z.string() } },
        },
        '500': jsonResponse(
          apiErrorSchema,
          'Collection failed. Retry errors with the same occurrence ID.',
        ),
      },
    },
  }),
];
