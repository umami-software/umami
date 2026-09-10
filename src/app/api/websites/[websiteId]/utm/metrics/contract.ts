import { z } from 'zod';
import { utmMetricsQuerySchema } from '@/lib/analytics-schema';
import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, notFoundResponse, unauthorizedResponse } from '@/openapi/schemas';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/utm/metrics',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteUtmMetrics',
      summary: 'Get website utm metrics',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid() }), query: utmMetricsQuerySchema },
      responses: {
        '200': {
          description: 'Analytics results.',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    utm: {
                      type: 'string',
                    },
                    views: {
                      type: 'number',
                    },
                  },
                  required: ['utm', 'views'],
                },
              },
            },
          },
        },
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
