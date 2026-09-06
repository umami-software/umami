import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, jsonResponse, unauthorizedResponse } from '@/openapi/schemas';
import { websiteIdPathSchema } from '../../response-schema';
import { analyticsQuerySchema, websitePageviewsSchema } from '../analytics-schema';

const getWebsitePageviewsOperation = defineOperation({
  method: 'get',
  path: '/api/websites/{websiteId}/pageviews',
  audience: 'public',
  auth: 'bearer-or-share',
  operation: {
    operationId: 'getWebsitePageviews',
    summary: 'Get pageview and session time series',
    description:
      'Returns pageviews and sessions bucketed by `unit` (minute, hour, day, month, year) in the given `timezone`. When `compare` is set the comparison period is included.',
    tags: ['Websites'],
    requestParams: {
      path: websiteIdPathSchema,
      query: analyticsQuerySchema,
    },
    responses: {
      '200': jsonResponse(websitePageviewsSchema, 'Time series.'),
      '400': badRequestResponse,
      '401': unauthorizedResponse,
    },
  },
});

export const operations = [getWebsitePageviewsOperation] as const;
