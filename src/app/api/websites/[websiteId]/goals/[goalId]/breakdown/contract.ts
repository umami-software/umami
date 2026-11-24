import { z } from 'zod';
import { savedBreakdownQuerySchema } from '@/lib/analytics-schema';
import { defineOperation } from '@/openapi/operation';
import {
  badRequestResponse,
  jsonResponse,
  notFoundResponse,
  unauthorizedResponse,
} from '@/openapi/schemas';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/goals/{goalId}/breakdown',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteSavedGoalBreakdown',
      summary: 'Get website saved goal breakdown',
      tags: ['Websites'],
      requestParams: {
        path: z.object({ websiteId: z.uuid(), goalId: z.uuid() }),
        query: savedBreakdownQuerySchema,
      },
      responses: {
        '200': jsonResponse(
          z.array(
            z.object({
              name: z.string(),
              visitors: z.number(),
              converted: z.number(),
            }),
          ),
          'The operation completed successfully.',
        ),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
