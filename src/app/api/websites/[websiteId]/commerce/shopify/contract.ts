import { z } from 'zod';
import { shopifyCommerceSchema } from '@/lib/commerce/shopify';
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
    path: '/api/websites/{websiteId}/commerce/shopify',
    audience: 'public',
    auth: 'bearer',
    operation: {
      operationId: 'importWebsiteShopifyCommerce',
      summary: 'Import Shopify order facts',
      tags: ['Websites'],
      description:
        'Accepts selected Shopify GraphQL Admin order fields from an authenticated integration. Imports completed orders and successful refund transactions in shop currency, skipping test orders. Does not create website traffic or reconstruct item state. This endpoint is not a Shopify webhook receiver.',
      requestParams: { path: z.object({ websiteId: z.uuid() }) },
      requestBody: {
        required: true,
        content: { 'application/json': { schema: shopifyCommerceSchema } },
      },
      responses: {
        '200': jsonResponse(z.object({ ids: z.array(z.uuid()) }), 'Stable imported identities.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
