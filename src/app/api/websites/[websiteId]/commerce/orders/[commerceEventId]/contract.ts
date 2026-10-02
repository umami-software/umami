import { z } from 'zod';
import { commerceOrderDetailSchema } from '@/lib/commerce-reports';
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
    path: '/api/websites/{websiteId}/commerce/orders/{commerceEventId}',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteCommerceOrder',
      summary: 'Get a website commerce order',
      tags: ['Websites'],
      requestParams: {
        path: z.object({ websiteId: z.uuid(), commerceEventId: z.uuid() }),
      },
      responses: {
        '200': jsonResponse(commerceOrderDetailSchema, 'The order with its items.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
