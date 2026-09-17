import { z } from 'zod';
import { attributionQuerySchema } from '@/lib/analytics-schema';
import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, notFoundResponse, unauthorizedResponse } from '@/openapi/schemas';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/attribution',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteAttribution',
      summary: 'Get website attribution',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid() }), query: attributionQuerySchema },
      responses: {
        '200': {
          description: 'The operation completed successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  referrer: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                        },
                        value: {
                          type: 'number',
                        },
                      },
                      required: ['name', 'value'],
                    },
                  },
                  paidAds: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                        },
                        value: {
                          type: 'number',
                        },
                      },
                      required: ['name', 'value'],
                    },
                  },
                  utm_source: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                        },
                        value: {
                          type: 'number',
                        },
                      },
                      required: ['name', 'value'],
                    },
                  },
                  utm_medium: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                        },
                        value: {
                          type: 'number',
                        },
                      },
                      required: ['name', 'value'],
                    },
                  },
                  utm_campaign: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                        },
                        value: {
                          type: 'number',
                        },
                      },
                      required: ['name', 'value'],
                    },
                  },
                  utm_content: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                        },
                        value: {
                          type: 'number',
                        },
                      },
                      required: ['name', 'value'],
                    },
                  },
                  utm_term: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                        },
                        value: {
                          type: 'number',
                        },
                      },
                      required: ['name', 'value'],
                    },
                  },
                  total: {
                    type: 'object',
                    properties: {
                      pageviews: {
                        type: 'number',
                      },
                      visitors: {
                        type: 'number',
                      },
                      visits: {
                        type: 'number',
                      },
                    },
                    required: ['pageviews', 'visitors', 'visits'],
                  },
                },
                required: [
                  'referrer',
                  'paidAds',
                  'utm_source',
                  'utm_medium',
                  'utm_campaign',
                  'utm_content',
                  'utm_term',
                  'total',
                ],
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
