import { defineOperation } from '@/openapi/operation';
import {
  badRequestResponse,
  jsonResponse,
  okSchema,
  serverErrorResponse,
  unauthorizedResponse,
} from '@/openapi/schemas';
import { updateWebsiteRequestSchema } from '../request-schema';
import { websiteIdPathSchema, websiteSchema } from '../response-schema';

const getWebsiteOperation = defineOperation({
  method: 'get',
  path: '/api/websites/{websiteId}',
  audience: 'public',
  auth: 'bearer-or-share',
  operation: {
    operationId: 'getWebsite',
    summary: 'Get a website',
    tags: ['Websites'],
    requestParams: {
      path: websiteIdPathSchema,
    },
    responses: {
      '200': jsonResponse(
        websiteSchema.nullable(),
        'Website details, or null if it does not exist.',
      ),
      '401': unauthorizedResponse,
    },
  },
});

const updateWebsiteOperation = defineOperation({
  method: 'post',
  path: '/api/websites/{websiteId}',
  audience: 'public',
  auth: 'bearer',
  operation: {
    operationId: 'updateWebsite',
    summary: 'Update a website',
    tags: ['Websites'],
    requestParams: {
      path: websiteIdPathSchema,
    },
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: updateWebsiteRequestSchema,
        },
      },
    },
    responses: {
      '200': jsonResponse(websiteSchema, 'Website updated.'),
      '400': badRequestResponse,
      '401': unauthorizedResponse,
      '500': serverErrorResponse,
    },
  },
});

const deleteWebsiteOperation = defineOperation({
  method: 'delete',
  path: '/api/websites/{websiteId}',
  audience: 'public',
  auth: 'bearer',
  operation: {
    operationId: 'deleteWebsite',
    summary: 'Delete a website',
    tags: ['Websites'],
    requestParams: {
      path: websiteIdPathSchema,
    },
    responses: {
      '200': jsonResponse(okSchema, 'Website deleted.'),
      '401': unauthorizedResponse,
    },
  },
});

export const operations = [
  getWebsiteOperation,
  updateWebsiteOperation,
  deleteWebsiteOperation,
] as const;
