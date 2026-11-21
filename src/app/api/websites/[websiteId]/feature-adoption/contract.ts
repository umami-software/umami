import { z } from 'zod';
import { featureAdoptionQuerySchema } from '@/lib/analytics-schema';
import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, notFoundResponse, unauthorizedResponse } from '@/openapi/schemas';

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/feature-adoption',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteFeatureAdoption',
      summary: 'Get website feature adoption',
      tags: ['Websites'],
      requestParams: { path: z.object({ websiteId: z.uuid() }), query: featureAdoptionQuerySchema },
      responses: {
        '200': {
          description: 'The operation completed successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  feature: { type: 'string' },
                  successEvent: { type: 'string', nullable: true },
                  activeUsers: { type: 'number' },
                  featureUsers: { type: 'number' },
                  newUsers: { type: 'number' },
                  returningUsers: { type: 'number' },
                  adoptionRate: { type: 'number' },
                  completedUsers: { type: 'number' },
                  completionRate: { type: 'number' },
                  series: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        date: { type: 'string' },
                        featureUsers: { type: 'number' },
                        newUsers: { type: 'number' },
                        returningUsers: { type: 'number' },
                      },
                      required: ['date', 'featureUsers', 'newUsers', 'returningUsers'],
                    },
                  },
                },
                required: [
                  'feature',
                  'activeUsers',
                  'featureUsers',
                  'newUsers',
                  'returningUsers',
                  'adoptionRate',
                  'completedUsers',
                  'completionRate',
                  'series',
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
