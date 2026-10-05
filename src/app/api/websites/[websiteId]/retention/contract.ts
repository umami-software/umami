import { z } from 'zod';
import { retentionQuerySchema } from '@/lib/analytics-schema';
import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, notFoundResponse, unauthorizedResponse } from '@/openapi/schemas';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/retention',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteRetention',
      summary: 'Get website retention',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid() }), query: retentionQuerySchema },
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
                    date: {
                      type: 'string',
                    },
                    day: {
                      type: 'number',
                    },
                    visitors: {
                      type: 'number',
                    },
                    returnVisitors: {
                      type: 'number',
                    },
                    percentage: {
                      type: 'number',
                    },
                  },
                  required: ['date', 'day', 'visitors', 'returnVisitors', 'percentage'],
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
