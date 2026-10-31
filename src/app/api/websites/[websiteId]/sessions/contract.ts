import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, jsonResponse, unauthorizedResponse } from '@/openapi/schemas';
import { websiteIdPathSchema } from '../../response-schema';
import { sessionQuerySchema, websiteSessionPageSchema } from '../analytics-schema';

const getWebsiteSessionsOperation = defineOperation({
  method: 'get',
  path: '/api/websites/{websiteId}/sessions',
  audience: 'public',
  auth: 'bearer-or-share',
  operation: {
    operationId: 'getWebsiteSessions',
    summary: 'List visitor sessions',
    description:
      'Returns a page of visitor sessions in the date range, newest first. `search` matches distinct ID, city, browser, OS or device. `minDuration` keeps only sessions whose visit lasted at least that many seconds.',
    tags: ['Websites'],
    requestParams: {
      path: websiteIdPathSchema,
      query: sessionQuerySchema,
    },
    responses: {
      '200': jsonResponse(websiteSessionPageSchema, 'A page of sessions.'),
      '400': badRequestResponse,
      '401': unauthorizedResponse,
    },
  },
});

export const operations = [getWebsiteSessionsOperation] as const;
