import { z } from 'zod';
import { funnelDefinitionSchema } from '@/lib/analytics-schema';
import { defineOperation } from '@/openapi/operation';
import {
  badRequestResponse,
  jsonResponse,
  notFoundResponse,
  okSchema,
  unauthorizedResponse,
} from '@/openapi/schemas';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/funnels/{funnelId}',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteFunnel',
      summary: 'Get website funnel',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid(), funnelId: z.uuid() }) },
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
    path: '/api/websites/{websiteId}/funnels/{funnelId}',
    audience: 'public',
    auth: 'bearer',
    operation: {
      operationId: 'updateWebsiteFunnel',
      summary: 'Update website funnel',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid(), funnelId: z.uuid() }) },
      requestBody: {
        required: true,
        content: { 'application/json': { schema: funnelDefinitionSchema } },
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
    path: '/api/websites/{websiteId}/funnels/{funnelId}',
    audience: 'public',
    auth: 'bearer',
    operation: {
      operationId: 'deleteWebsiteFunnel',
      summary: 'Delete website funnel',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid(), funnelId: z.uuid() }) },
      responses: {
        '200': jsonResponse(okSchema, 'Deleted successfully.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
