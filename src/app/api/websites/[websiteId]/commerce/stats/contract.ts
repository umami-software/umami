import { z } from 'zod';
import { commerceStatsQuerySchema } from '@/lib/analytics-schema';
import { commerceStatsResponseSchema } from '@/lib/commerce-reports';
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
    path: '/api/websites/{websiteId}/commerce/stats',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteCommerceStats',
      summary: 'Get website commerce totals',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid() }), query: commerceStatsQuerySchema },
      responses: {
        '200': jsonResponse(commerceStatsResponseSchema, 'Analytics results.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
