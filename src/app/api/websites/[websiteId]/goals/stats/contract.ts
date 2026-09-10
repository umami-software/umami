import { z } from 'zod';
import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, unauthorizedResponse, notFoundResponse } from '@/openapi/schemas';
import { goalQuerySchema } from '@/lib/analytics-schema';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/goals/stats',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteGoalStats',
      summary: 'Get website goal stats',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid() }), query: goalQuerySchema },
      responses: {
        '200': {
          description: 'The operation completed successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  num: {
                    type: 'number',
                  },
                  total: {
                    type: 'number',
                  },
                },
                required: ['num', 'total'],
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
