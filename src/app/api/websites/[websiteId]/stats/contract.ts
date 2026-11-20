import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, jsonResponse, unauthorizedResponse } from '@/openapi/schemas';
import { websiteIdPathSchema } from '../../response-schema';
import { websiteStatsQuerySchema, websiteStatsSchema } from '../analytics-schema';

const getWebsiteStatsOperation = defineOperation({
  method: 'get',
  path: '/api/websites/{websiteId}/stats',
  audience: 'public',
  auth: 'bearer-or-share',
  operation: {
    operationId: 'getWebsiteStats',
    summary: 'Get website summary stats',
    description:
      'Returns pageviews, unique visitors, visits, bounces and total time on site for the date range, plus the same totals for the comparison period (`compare`: prev or yoy). Pass `compare=none` to skip the comparison.',
    tags: ['Websites'],
    requestParams: {
      path: websiteIdPathSchema,
      query: websiteStatsQuerySchema,
    },
    responses: {
      '200': jsonResponse(
        websiteStatsSchema,
        'Summary stats, with the comparison unless `compare` is none.',
      ),
      '400': badRequestResponse,
      '401': unauthorizedResponse,
    },
  },
});

export const operations = [getWebsiteStatsOperation] as const;
