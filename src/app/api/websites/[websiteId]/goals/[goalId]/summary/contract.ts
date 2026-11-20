import { z } from 'zod';
import { savedStatsQuerySchema } from '@/lib/analytics-schema';
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
    path: '/api/websites/{websiteId}/goals/{goalId}/summary',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteSavedGoalSummary',
      summary: 'Get website saved goal summary',
      tags: ['Websites'],
      requestParams: {
        path: z.object({ websiteId: z.uuid(), goalId: z.uuid() }),
        query: savedStatsQuerySchema,
      },
      responses: {
        '200': jsonResponse(
          z.object({
            completions: z.number(),
            median: z.number().nullable(),
          }),
          'The operation completed successfully.',
        ),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
