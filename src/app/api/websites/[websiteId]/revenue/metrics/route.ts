import { z } from 'zod';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { filterParams, withDateRange } from '@/lib/schema';
import { canViewWebsiteSection } from '@/permissions';
import type { RevenuParameters } from '@/queries/sql/reports/getRevenueChart';
import { getRevenueMetrics, type RevenueMetricType } from '@/queries/sql/reports/getRevenueMetrics';

const revenueMetricType = z.enum(['country', 'region', 'referrer', 'channel']);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = withDateRange({
    type: revenueMetricType,
    currency: z.string(),
    ...filterParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsiteSection(auth, websiteId, 'revenue'))) {
    return unauthorized();
  }

  const { type, currency } = query;
  const filters = await getQueryFilters(query, websiteId);

  if (!type) {
    return badRequest();
  }

  const parameters = { ...filters, currency } as RevenuParameters;

  return json(await getRevenueMetrics(websiteId, parameters, filters, type as RevenueMetricType));
}
