import { z } from 'zod';
import { recordCommerceSchema } from '@/lib/commerce';
import { defineOperation } from '@/openapi/operation';
import {
  badRequestResponse,
  jsonResponse,
  notFoundResponse,
  unauthorizedResponse,
} from '@/openapi/schemas';

export const operations = [
  defineOperation({
    method: 'post',
    path: '/api/websites/{websiteId}/commerce',
    audience: 'public',
    auth: 'bearer',
    operation: {
      operationId: 'recordWebsiteCommerce',
      summary: 'Record an order or refund',
      tags: ['Websites'],
      description:
        'Records an authoritative order or refund independently of browser activity. Requires website edit access. Amounts are independent of optional line items. Retries deduplicate by source and external identity. Newer source updatedAt timestamps replace full order snapshots; refunds are immutable.',
      requestParams: { path: z.object({ websiteId: z.uuid() }) },
      requestBody: {
        required: true,
        content: { 'application/json': { schema: recordCommerceSchema } },
      },
      responses: {
        '200': jsonResponse(z.object({ id: z.uuid() }), 'Stable record identity.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
