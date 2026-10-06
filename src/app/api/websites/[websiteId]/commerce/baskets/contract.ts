import { z } from 'zod';
import { commerceBasketsQuerySchema } from '@/lib/analytics-schema';
import { commerceBasketsResponseSchema } from '@/lib/commerce-reports';
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
    path: '/api/websites/{websiteId}/commerce/baskets',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteCommerceBaskets',
      summary: 'Get website commerce basket analysis',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid() }), query: commerceBasketsQuerySchema },
      responses: {
        '200': jsonResponse(commerceBasketsResponseSchema, 'Analytics results.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
