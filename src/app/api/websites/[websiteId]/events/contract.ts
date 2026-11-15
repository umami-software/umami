import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, jsonResponse, unauthorizedResponse } from '@/openapi/schemas';
import { websiteIdPathSchema } from '../../response-schema';
import { pagedAnalyticsQuerySchema, websiteEventPageSchema } from '../analytics-schema';

const getWebsiteEventsOperation = defineOperation({
  method: 'get',
  path: '/api/websites/{websiteId}/events',
  audience: 'public',
  auth: 'bearer-or-share',
  operation: {
    operationId: 'getWebsiteEvents',
    summary: 'List tracked events',
    description:
      'Returns a page of pageviews and custom events in the date range, newest first. Filter with `event` for a specific event name or `search` for free text.',
    tags: ['Websites'],
    requestParams: {
      path: websiteIdPathSchema,
      query: pagedAnalyticsQuerySchema,
    },
    responses: {
      '200': jsonResponse(websiteEventPageSchema, 'A page of events.'),
      '400': badRequestResponse,
      '401': unauthorizedResponse,
    },
  },
});

export const operations = [getWebsiteEventsOperation] as const;
