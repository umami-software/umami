import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, jsonResponse, unauthorizedResponse } from '@/openapi/schemas';
import { websiteIdPathSchema } from '../../response-schema';
import { analyticsQuerySchema, websiteStatsSchema } from '../analytics-schema';

const getWebsiteStatsOperation = defineOperation({
  method: 'get',
  path: '/api/websites/{websiteId}/stats',
  audience: 'public',
  auth: 'bearer-or-share',
  operation: {
    operationId: 'getWebsiteStats',
    summary: 'Get website summary stats',
    description:
      'Returns pageviews, unique visitors, visits, bounces and total time on site for the date range, plus the same totals for the comparison period (`compare`: prev or yoy).',
    tags: ['Websites'],
    requestParams: {
      path: websiteIdPathSchema,
      query: analyticsQuerySchema,
    },
    responses: {
      '200': jsonResponse(websiteStatsSchema, 'Summary stats with comparison.'),
      '400': badRequestResponse,
      '401': unauthorizedResponse,
    },
  },
});

export const operations = [getWebsiteStatsOperation] as const;
