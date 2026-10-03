import { z } from 'zod';
import { commerceAttributionQuerySchema } from '@/lib/analytics-schema';
import { commerceAttributionResponseSchema } from '@/lib/commerce-reports';
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
    path: '/api/websites/{websiteId}/commerce/attribution',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteCommerceAttribution',
      summary: 'Get website commerce revenue attribution',
      tags: ['Websites'],
      requestParams: {
        path: z.object({ websiteId: z.uuid() }),
        query: commerceAttributionQuerySchema,
      },
      responses: {
        '200': jsonResponse(commerceAttributionResponseSchema, 'Analytics results.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
