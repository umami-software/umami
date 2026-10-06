import { z } from 'zod';
import { commerceOrdersQuerySchema } from '@/lib/analytics-schema';
import { commerceOrdersResponseSchema } from '@/lib/commerce-reports';
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
    path: '/api/websites/{websiteId}/commerce/orders',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteCommerceOrders',
      summary: 'List website commerce orders',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid() }), query: commerceOrdersQuerySchema },
      responses: {
        '200': jsonResponse(commerceOrdersResponseSchema, 'Analytics results.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
