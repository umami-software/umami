import { z } from 'zod';
import { getCompareDate } from '@/lib/date';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams, withDateRange } from '@/lib/schema';
import { canViewWebsiteSection } from '@/permissions';
import type { RevenuParameters } from '@/queries/sql/reports/getRevenueChart';
import { getRevenueStats } from '@/queries/sql/reports/getRevenueStats';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = withDateRange({
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

  const { currency } = query;
  const filters = await getQueryFilters(query, websiteId);
  const parameters = { ...filters, currency } as RevenuParameters;
  const { compare = 'prev' } = parameters;
  const { startDate, endDate } = getCompareDate(compare, parameters.startDate, parameters.endDate);
  const comparisonParameters = { ...parameters, startDate, endDate };

  const [stats, comparison] = await Promise.all([
    getRevenueStats(websiteId, parameters, filters),
    getRevenueStats(websiteId, comparisonParameters, filters),
  ]);

  return json({ ...stats, comparison });
}
