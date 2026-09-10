import { z } from 'zod';
import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, unauthorizedResponse, notFoundResponse } from '@/openapi/schemas';
import { definitionListSchema, funnelDefinitionSchema } from '@/lib/analytics-schema';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/funnels',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteFunnels',
      summary: 'Get website funnels',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid() }), query: definitionListSchema },
      responses: {
        '200': {
          description: 'The operation completed successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: {
                      allOf: [
                        {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                            },
                            userId: {
                              type: 'string',
                            },
                            createdAt: {
                              type: 'string',
                              format: 'date-time',
                            },
                            updatedAt: {
                              type: 'string',
                              format: 'date-time',
                            },
                            name: {
                              type: 'string',
                            },
                            type: {
                              type: 'string',
                            },
                            description: {
                              type: 'string',
                            },
                            parameters: {
                              anyOf: [
                                {
                                  type: 'string',
                                },
                                {
                                  type: 'number',
                                },
                                {
                                  const: false,
                                },
                                {
                                  const: true,
                                },
                                {
                                  type: 'object',
                                  properties: {},
                                  additionalProperties: {
                                    anyOf: [
                                      {
                                        type: 'string',
                                      },
                                      {
                                        type: 'number',
                                      },
                                      {
                                        const: false,
                                      },
                                      {
                                        const: true,
                                      },
                                      {},
                                      {
                                        type: 'object',
                                        properties: {
                                          length: {
                                            type: 'number',
                                          },
                                        },
                                        required: ['length'],
                                      },
                                    ],
                                  },
                                },
                                {
                                  type: 'object',
                                  properties: {
                                    length: {
                                      type: 'number',
                                    },
                                  },
                                  required: ['length'],
                                },
                              ],
                            },
                            websiteId: {
                              type: 'string',
                            },
                          },
                          required: [
                            'id',
                            'userId',
                            'createdAt',
                            'updatedAt',
                            'name',
                            'type',
                            'description',
                            'parameters',
                            'websiteId',
                          ],
                        },
                        {
                          type: 'object',
                          properties: {
                            website: {
                              type: 'object',
                              properties: {
                                domain: {
                                  type: 'string',
                                },
                                userId: {
                                  type: 'string',
                                },
                              },
                              required: ['domain', 'userId'],
                            },
                          },
                        },
                      ],
                    },
                  },
                  count: {
                    type: 'number',
                  },
                  page: {
                    type: 'number',
                  },
                  pageSize: {
                    type: 'number',
                  },
                  orderBy: {
                    type: 'string',
                  },
                  sortDescending: {
                    type: 'boolean',
                  },
                  search: {
                    type: 'string',
                  },
                  isCapped: {
                    type: 'boolean',
                  },
                },
                required: ['data', 'count', 'page', 'pageSize'],
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
  defineOperation({
    method: 'post',
    path: '/api/websites/{websiteId}/funnels',
    audience: 'public',
    auth: 'bearer',
    operation: {
      operationId: 'createWebsiteFunnel',
      summary: 'Create website funnel',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid() }) },
      requestBody: {
        required: true,
        content: { 'application/json': { schema: funnelDefinitionSchema } },
      },
      responses: {
        '200': {
          description: 'The operation completed successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  ok: {
                    const: true,
                  },
                },
                required: ['ok'],
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
