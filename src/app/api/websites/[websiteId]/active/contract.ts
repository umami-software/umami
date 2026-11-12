import { defineOperation } from '@/openapi/operation';
import { jsonResponse, unauthorizedResponse } from '@/openapi/schemas';
import { websiteIdPathSchema } from '../../response-schema';
import { activeVisitorsSchema } from '../analytics-schema';

const getWebsiteActiveOperation = defineOperation({
  method: 'get',
  path: '/api/websites/{websiteId}/active',
  audience: 'public',
  auth: 'bearer-or-share',
  operation: {
    operationId: 'getWebsiteActive',
    summary: 'Get current active visitors',
    description: 'Returns the number of visitors active on the website in the last few minutes.',
    tags: ['Websites'],
    requestParams: {
      path: websiteIdPathSchema,
    },
    responses: {
      '200': jsonResponse(activeVisitorsSchema, 'Active visitor count.'),
      '401': unauthorizedResponse,
    },
  },
});

export const operations = [getWebsiteActiveOperation] as const;
