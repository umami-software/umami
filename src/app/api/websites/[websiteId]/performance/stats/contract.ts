import { z } from 'zod';
import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, unauthorizedResponse, notFoundResponse } from '@/openapi/schemas';
import { performanceStatsQuerySchema } from '@/lib/analytics-schema';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/performance/stats',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsitePerformanceStats',
      summary: 'Get website performance stats',
      tags: ['Websites'],
      requestParams: {
        path: z.object({ websiteId: z.uuid() }),
        query: performanceStatsQuerySchema,
      },
      responses: {
        '200': {
          description: 'Analytics results.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  lcp: {
                    type: 'object',
                    properties: {
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
                    required: ['p50', 'p75', 'p95'],
                  },
                  inp: {
                    type: 'object',
                    properties: {
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
                    required: ['p50', 'p75', 'p95'],
                  },
                  cls: {
                    type: 'object',
                    properties: {
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
                    required: ['p50', 'p75', 'p95'],
                  },
                  fcp: {
                    type: 'object',
                    properties: {
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
                    required: ['p50', 'p75', 'p95'],
                  },
                  ttfb: {
                    type: 'object',
                    properties: {
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
                    required: ['p50', 'p75', 'p95'],
                  },
                  count: {
                    type: 'number',
                  },
                },
                required: ['lcp', 'inp', 'cls', 'fcp', 'ttfb', 'count'],
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
