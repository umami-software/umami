import { z } from 'zod';
import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, unauthorizedResponse, notFoundResponse } from '@/openapi/schemas';
import { journeyQuerySchema } from '@/lib/analytics-schema';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/journeys',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteJourneys',
      summary: 'Get website journeys',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid() }), query: journeyQuerySchema },
      responses: {
        '200': {
          description: 'Analytics results.',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                    count: {
                      type: 'number',
                    },
                  },
                  required: ['items', 'count'],
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
