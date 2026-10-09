import { z } from 'zod';
import { savedStatsQuerySchema } from '@/lib/analytics-schema';
import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, notFoundResponse, unauthorizedResponse } from '@/openapi/schemas';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/goals/{goalId}/stats',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteSavedGoalStats',
      summary: 'Get website saved goal stats',
      tags: ['Websites'],
      requestParams: {
        path: z.object({ websiteId: z.uuid(), goalId: z.uuid() }),
        query: savedStatsQuerySchema,
      },
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
