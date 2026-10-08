import { z } from 'zod';
import { commerceChartQuerySchema } from '@/lib/analytics-schema';
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
    path: '/api/websites/{websiteId}/commerce/markets',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteCommerceMarkets',
      summary: 'List website commerce markets',
      tags: ['Websites'],
      requestParams: {
        path: z.object({ websiteId: z.uuid() }),
        query: commerceChartQuerySchema,
      },
      responses: {
        '200': jsonResponse(z.array(z.object({ name: z.string() })), 'Commerce markets.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
