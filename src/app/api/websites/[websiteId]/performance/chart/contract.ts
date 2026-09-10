import { z } from 'zod';
import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, unauthorizedResponse, notFoundResponse } from '@/openapi/schemas';
import { performanceChartQuerySchema } from '@/lib/analytics-schema';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/performance/chart',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsitePerformanceChart',
      summary: 'Get website performance chart',
      tags: ['Websites'],
      requestParams: {
        path: z.object({ websiteId: z.uuid() }),
        query: performanceChartQuerySchema,
      },
      responses: {
        '200': {
          description: 'Analytics results.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  chart: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        t: {
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
                      },
                      required: ['t', 'p50', 'p75', 'p95'],
                    },
                  },
                },
                required: ['chart'],
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
