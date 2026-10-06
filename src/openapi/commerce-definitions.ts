import { z } from 'zod';
import { commerceChartQuerySchema, definitionListSchema } from '@/lib/analytics-schema';
import {
  commerceCheckoutResponseSchema,
  commerceProductsResponseSchema,
} from '@/lib/commerce-reports';
import {
  commerceReportDefinitionSchema,
  commerceReportParametersSchema,
  savedCommerceStatsQuerySchema,
} from '@/lib/commerce-saved-reports';
import { defineOperation } from './operation';
import {
  badRequestResponse,
  jsonResponse,
  notFoundResponse,
  unauthorizedResponse,
} from './schemas';

const report = commerceReportDefinitionSchema.extend({
  parameters: commerceReportParametersSchema.extend({ timezone: z.string() }),
  id: z.uuid(),
  websiteId: z.uuid(),
  userId: z.uuid(),
  type: z.literal('commerce'),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});
const paths = { websiteId: z.uuid() };
function operation(
  method: 'get' | 'post' | 'delete',
  path: string,
  operationId: string,
  response: z.ZodType,
  query?: z.ZodObject<any>,
  body?: z.ZodType,
  reportId = false,
) {
  return defineOperation({
    method,
    path: `/api/websites/{websiteId}/commerce/${path}`,
    audience: 'public',
    auth: method === 'get' ? 'bearer-or-share' : 'bearer',
    operation: {
      operationId,
      summary: operationId.replace(/([A-Z])/g, ' $1').trim(),
      tags: ['Websites'],
      requestParams: {
        path: z.object({ ...paths, ...(reportId ? { reportId: z.uuid() } : {}) }),
        ...(query ? { query } : {}),
      },
      ...(body
        ? { requestBody: { required: true, content: { 'application/json': { schema: body } } } }
        : {}),
      responses: {
        '200': jsonResponse(response, 'Commerce result.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  });
}
export const reportListOperations = [
  operation(
    'get',
    'reports',
    'getWebsiteCommerceReports',
    z.object({ data: z.array(report), count: z.number(), page: z.number(), pageSize: z.number() }),
    definitionListSchema,
  ),
  operation(
    'post',
    'reports',
    'createWebsiteCommerceReport',
    report,
    undefined,
    commerceReportDefinitionSchema,
  ),
];
export const reportOperations = [
  operation(
    'get',
    'reports/{reportId}',
    'getWebsiteCommerceReport',
    report,
    undefined,
    undefined,
    true,
  ),
  operation(
    'post',
    'reports/{reportId}',
    'updateWebsiteCommerceReport',
    report,
    undefined,
    commerceReportDefinitionSchema,
    true,
  ),
  operation(
    'delete',
    'reports/{reportId}',
    'deleteWebsiteCommerceReport',
    z.object({ ok: z.literal(true) }),
    undefined,
    undefined,
    true,
  ),
];
export const reportStatsOperations = [
  operation(
    'get',
    'reports/{reportId}/stats',
    'getWebsiteCommerceReportStats',
    z.object({
      report,
      data: z.union([commerceProductsResponseSchema, commerceCheckoutResponseSchema]),
    }),
    savedCommerceStatsQuerySchema,
    undefined,
    true,
  ),
];
export const marketOperations = [
  operation(
    'get',
    'markets',
    'getWebsiteCommerceMarkets',
    z.array(z.object({ name: z.string() })),
    commerceChartQuerySchema,
  ),
];
