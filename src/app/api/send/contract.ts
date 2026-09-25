// Collection contract; commerce uses the same schema as ingestion.

import { z } from 'zod';
import type { ZodOpenApiOperationObject } from 'zod-openapi';
import { defineOperation } from '@/openapi/operation';
import { collectionSchema } from './request-schema';

const operation1 = defineOperation({
  method: 'post',
  path: '/api/send',
  audience: 'collect',
  auth: 'none',
  operation: {
    operationId: 'send',
    summary: 'Create or update send',
    tags: ['Collection'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: z.toJSONSchema(collectionSchema, { io: 'input' }),
        },
      },
    },
    responses: {
      '200': {
        description: 'The operation completed successfully.',
        content: {
          'application/json': {
            schema: {
              anyOf: [
                {
                  type: 'object',
                  properties: {
                    beep: {
                      type: 'string',
                    },
                  },
                  required: ['beep'],
                },
                {
                  type: 'object',
                  properties: {
                    cache: {},
                    sessionId: {},
                    visitId: {},
                  },
                  required: ['cache', 'sessionId', 'visitId'],
                },
              ],
            },
          },
        },
      },
      '400': {
        description: 'Bad request.',
        content: {
          'application/json': {
            example: {
              error: {
                message: 'Bad request.',
                code: 'bad-request',
                status: 400,
              },
            },
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
          },
        },
      },
      '403': {
        description: 'Forbidden.',
        content: {
          'application/json': {
            example: {
              error: {
                message: 'Forbidden.',
                code: 'forbidden',
                status: 403,
              },
            },
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
          },
        },
      },
      '500': {
        description: 'Server error.',
        content: {
          'application/json': {
            example: {
              error: {
                message: 'Server error.',
                code: 'server-error',
                status: 500,
              },
            },
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
          },
        },
      },
    },
  } as ZodOpenApiOperationObject,
});

export const operations = [operation1] as const;
