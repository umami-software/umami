import { z } from 'zod';
import { commerceCheckoutQuerySchema } from '@/lib/analytics-schema';
import { commerceCheckoutResponseSchema } from '@/lib/commerce-reports';
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
    path: '/api/websites/{websiteId}/commerce/checkout',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteCommerceCheckout',
      summary: 'Get website checkout funnel',
      tags: ['Websites'],
      requestParams: {
        path: z.object({ websiteId: z.uuid() }),
        query: commerceCheckoutQuerySchema,
      },
      responses: {
        '200': jsonResponse(commerceCheckoutResponseSchema, 'Analytics results.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
