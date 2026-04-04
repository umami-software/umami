import { getCompareDate } from '@/lib/date';
import { getQueryFilters, parseRequest, setWebsiteDate } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { reportResultSchema } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { getRevenue, type RevenuParameters } from '@/queries/sql/reports/getRevenue';
import { getRevenueMetrics } from '@/queries/sql/reports/getRevenueMetrics';
import { getRevenueStats } from '@/queries/sql/reports/getRevenueStats';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const { websiteId } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const parameters = await setWebsiteDate(websiteId, body.parameters);
  const filters = await getQueryFilters(body.filters, websiteId);

  const [{ chart }, total, metrics] = await Promise.all([
    getRevenue(websiteId, parameters as RevenuParameters, filters),
    getRevenueStats(websiteId, parameters as RevenuParameters, filters),
    getRevenueMetrics(websiteId, parameters as RevenuParameters, filters),
  ]);

  const { compare = 'prev' } = parameters as RevenuParameters;
  const { startDate, endDate } = getCompareDate(compare, parameters.startDate, parameters.endDate);
  const comparison = await getRevenueStats(
    websiteId,
    { ...(parameters as RevenuParameters), startDate, endDate },
    filters,
  );

  return json({ chart, total: { ...total, comparison }, ...metrics });
}
