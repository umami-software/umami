import { z } from 'zod';
import { commerceBuyersQuerySchema } from '@/lib/analytics-schema';
import { commerceBuyersResponseSchema } from '@/lib/commerce-reports';
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
    path: '/api/websites/{websiteId}/commerce/buyers',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteCommerceBuyers',
      summary: 'List website commerce buyers',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid() }), query: commerceBuyersQuerySchema },
      responses: {
        '200': jsonResponse(commerceBuyersResponseSchema, 'Analytics results.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
