import { z } from 'zod';
import { commerceChartQuerySchema } from '@/lib/analytics-schema';
import { commerceChartResponseSchema } from '@/lib/commerce-reports';
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
    path: '/api/websites/{websiteId}/commerce/chart',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteCommerceChart',
      summary: 'Get website commerce revenue over time',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid() }), query: commerceChartQuerySchema },
      responses: {
        '200': jsonResponse(commerceChartResponseSchema, 'Analytics results.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
