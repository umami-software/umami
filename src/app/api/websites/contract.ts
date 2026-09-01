import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, jsonResponse, unauthorizedResponse } from '@/openapi/schemas';
import { createWebsiteRequestSchema, listWebsitesQuerySchema } from './request-schema';
import { websitePageSchema, websiteSchema } from './response-schema';

const listWebsitesOperation = defineOperation({
  method: 'get',
  path: '/api/websites',
  audience: 'public',
  auth: 'bearer',
  operation: {
    operationId: 'listWebsites',
    summary: 'List websites',
    description: 'Returns websites owned by the authenticated user.',
    tags: ['Websites'],
    requestParams: {
      query: listWebsitesQuerySchema,
    },
    responses: {
      '200': jsonResponse(websitePageSchema, 'A page of websites.'),
      '400': badRequestResponse,
      '401': unauthorizedResponse,
    },
  },
});

const createWebsiteOperation = defineOperation({
  method: 'post',
  path: '/api/websites',
  audience: 'public',
  auth: 'bearer',
  operation: {
    operationId: 'createWebsite',
    summary: 'Create a website',
    tags: ['Websites'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: createWebsiteRequestSchema,
        },
      },
    },
    responses: {
      '200': jsonResponse(websiteSchema, 'Website created.'),
      '400': badRequestResponse,
      '401': unauthorizedResponse,
    },
  },
});

export const operations = [listWebsitesOperation, createWebsiteOperation] as const;
