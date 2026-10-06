import { z } from 'zod';
import { commerceAbandonedQuerySchema } from '@/lib/analytics-schema';
import { commerceAbandonedResponseSchema } from '@/lib/commerce-reports';
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
    path: '/api/websites/{websiteId}/commerce/abandoned',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteCommerceAbandoned',
      summary: 'List abandoned carts and checkouts',
      tags: ['Websites'],
      requestParams: {
        path: z.object({ websiteId: z.uuid() }),
        query: commerceAbandonedQuerySchema,
      },
      responses: {
        '200': jsonResponse(commerceAbandonedResponseSchema, 'Analytics results.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
