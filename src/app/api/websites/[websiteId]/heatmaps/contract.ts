import { z } from 'zod';
import { heatmapQuerySchema } from '@/lib/analytics-schema';
import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, notFoundResponse, unauthorizedResponse } from '@/openapi/schemas';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/heatmaps',
    audience: 'public',
    auth: 'bearer',
    operation: {
      operationId: 'getWebsiteHeatmaps',
      summary: 'Get website heatmaps',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid() }), query: heatmapQuerySchema },
      responses: {
        '200': {
          description: 'The operation completed successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  mode: {
                    anyOf: [
                      {
                        const: 'click',
                      },
                      {
                        const: 'scroll',
                      },
                    ],
                  },
                  pages: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        urlPath: {
                          type: 'string',
                        },
                        count: {
                          type: 'number',
                        },
                        sessions: {
                          type: 'number',
                        },
                      },
                      required: ['urlPath', 'count', 'sessions'],
                    },
                  },
                  points: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        x: {
                          type: 'number',
                        },
                        y: {
                          type: 'number',
                        },
                        pageX: {
                          type: 'number',
                        },
                        pageY: {
                          type: 'number',
                        },
                        pageW: {
                          type: 'number',
                        },
                        pageH: {
                          type: 'number',
                        },
                        viewportW: {
                          type: 'number',
                        },
                        viewportH: {
                          type: 'number',
                        },
                        count: {
                          type: 'number',
                        },
                      },
                      required: [
                        'x',
                        'y',
                        'pageX',
                        'pageY',
                        'pageW',
                        'pageH',
                        'viewportW',
                        'viewportH',
                        'count',
                      ],
                    },
                  },
                  snapshot: {
                    type: 'object',
                    properties: {
                      kind: {
                        const: 'iframe',
                      },
                      id: {
                        type: 'string',
                      },
                      url: {
                        type: 'string',
                      },
                      pageW: {
                        type: 'number',
                      },
                      pageH: {
                        type: 'number',
                      },
                      viewportW: {
                        type: 'number',
                      },
                      viewportH: {
                        type: 'number',
                      },
                    },
                    required: ['kind', 'id', 'url', 'pageW', 'pageH', 'viewportW', 'viewportH'],
                  },
                  scroll: {
                    type: 'object',
                    properties: {
                      buckets: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            depth: {
                              type: 'number',
                            },
                            sessions: {
                              type: 'number',
                            },
                            pageW: {
                              type: 'number',
                            },
                            pageH: {
                              type: 'number',
                            },
                            viewportW: {
                              type: 'number',
                            },
                            viewportH: {
                              type: 'number',
                            },
                          },
                          required: [
                            'depth',
                            'sessions',
                            'pageW',
                            'pageH',
                            'viewportW',
                            'viewportH',
                          ],
                        },
                      },
                      totalSessions: {
                        type: 'number',
                      },
                      pageW: {
                        type: 'number',
                      },
                      pageH: {
                        type: 'number',
                      },
                      viewportW: {
                        type: 'number',
                      },
                      viewportH: {
                        type: 'number',
                      },
                    },
                    required: [
                      'buckets',
                      'totalSessions',
                      'pageW',
                      'pageH',
                      'viewportW',
                      'viewportH',
                    ],
                  },
                },
                required: ['mode', 'pages', 'points', 'snapshot', 'scroll'],
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
