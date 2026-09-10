import { z } from 'zod';
import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, unauthorizedResponse, notFoundResponse } from '@/openapi/schemas';
import { performanceMetricsQuerySchema } from '@/lib/analytics-schema';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/performance/metrics',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsitePerformanceMetrics',
      summary: 'Get website performance metrics',
      tags: ['Websites'],
      requestParams: {
        path: z.object({ websiteId: z.uuid() }),
        query: performanceMetricsQuerySchema,
      },
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
                    name: {
                      type: 'string',
                    },
                    p50: {
                      type: 'number',
                    },
                    p75: {
                      type: 'number',
                    },
                    p95: {
                      type: 'number',
                    },
                    count: {
                      type: 'number',
                    },
                  },
                  required: ['name', 'p50', 'p75', 'p95', 'count'],
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
