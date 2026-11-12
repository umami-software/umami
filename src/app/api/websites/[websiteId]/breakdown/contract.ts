import { z } from 'zod';
import { breakdownQuerySchema } from '@/lib/analytics-schema';
import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, notFoundResponse, unauthorizedResponse } from '@/openapi/schemas';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/breakdown',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteBreakdown',
      summary: 'Get website breakdown',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid() }), query: breakdownQuerySchema },
      responses: {
        '200': {
          description: 'The operation completed successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    views: {
                      type: 'number',
                    },
                    visitors: {
                      type: 'number',
                    },
                    visits: {
                      type: 'number',
                    },
                    bounces: {
                      type: 'number',
                    },
                    totaltime: {
                      type: 'number',
                    },
                  },
                  required: ['views', 'visitors', 'visits', 'bounces', 'totaltime'],
                  additionalProperties: {
                    anyOf: [
                      {
                        type: 'string',
                      },
                      {
                        type: 'number',
                      },
                    ],
                  },
                },
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
] as const;
