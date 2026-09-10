import { z } from 'zod';
import { defineOperation } from '@/openapi/operation';
import {
  badRequestResponse,
  unauthorizedResponse,
  notFoundResponse,
  jsonResponse,
  okSchema,
} from '@/openapi/schemas';
import { goalDefinitionSchema } from '@/lib/analytics-schema';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/goals/{goalId}',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteGoal',
      summary: 'Get website goal',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid(), goalId: z.uuid() }) },
      responses: {
        '200': {
          description: 'The operation completed successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  ok: {
                    const: true,
                  },
                },
                required: ['ok'],
              },
            },
          },
        },
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
  defineOperation({
    method: 'post',
    path: '/api/websites/{websiteId}/goals/{goalId}',
    audience: 'public',
    auth: 'bearer',
    operation: {
      operationId: 'updateWebsiteGoal',
      summary: 'Update website goal',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid(), goalId: z.uuid() }) },
      requestBody: {
        required: true,
        content: { 'application/json': { schema: goalDefinitionSchema } },
      },
      responses: {
        '200': {
          description: 'The operation completed successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  ok: {
                    const: true,
                  },
                },
                required: ['ok'],
              },
            },
          },
        },
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
  defineOperation({
    method: 'delete',
    path: '/api/websites/{websiteId}/goals/{goalId}',
    audience: 'public',
    auth: 'bearer',
    operation: {
      operationId: 'deleteWebsiteGoal',
      summary: 'Delete website goal',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid(), goalId: z.uuid() }) },
      responses: {
        '200': jsonResponse(okSchema, 'Deleted successfully.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
