import { getCompareDate } from '@/lib/date';
import { getQueryFilters, parseRequest, setWebsiteDate } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { reportResultSchema } from '@/lib/schema';
import { canViewWebsiteSection } from '@/permissions';
import { getRevenueChart, type RevenuParameters } from '@/queries/sql/reports/getRevenueChart';
import {
  getRevenueMetrics,
  type RevenueMetricsResult,
} from '@/queries/sql/reports/getRevenueMetrics';
import { getRevenueStats } from '@/queries/sql/reports/getRevenueStats';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const { websiteId } = body;

  if (!(await canViewWebsiteSection(auth, websiteId, 'revenue'))) {
    return unauthorized();
  }

  const parameters = await setWebsiteDate(websiteId, body.parameters);
  const filters = await getQueryFilters(body.filters, websiteId);
  const { compare = 'prev' } = parameters as RevenuParameters;
  const { startDate, endDate } = getCompareDate(compare, parameters.startDate, parameters.endDate);
  const comparisonParameters = { ...(parameters as RevenuParameters), startDate, endDate };

  const [{ chart }, total, comparison, country, region, referrer, channel] = await Promise.all([
    getRevenueChart(websiteId, parameters as RevenuParameters, filters),
    getRevenueStats(websiteId, parameters as RevenuParameters, filters),
    getRevenueStats(websiteId, comparisonParameters, filters),
    getRevenueMetrics(websiteId, parameters as RevenuParameters, filters, 'country') as Promise<
      RevenueMetricsResult['country']
    >,
    getRevenueMetrics(websiteId, parameters as RevenuParameters, filters, 'region') as Promise<
      RevenueMetricsResult['region']
    >,
    getRevenueMetrics(websiteId, parameters as RevenuParameters, filters, 'referrer') as Promise<
      RevenueMetricsResult['referrer']
    >,
    getRevenueMetrics(websiteId, parameters as RevenuParameters, filters, 'channel') as Promise<
      RevenueMetricsResult['channel']
    >,
  ]);

  return json({ chart, total: { ...total, comparison }, country, region, referrer, channel });
}
