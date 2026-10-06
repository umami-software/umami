import { commerceStatsQuerySchema } from '@/lib/analytics-schema';
import { getCommerceRequestParameters } from '@/lib/commerce-reports';
import { getCompareDate } from '@/lib/date';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsiteSection } from '@/permissions';
import { getCommerceStats } from '@/queries/sql/commerce/getCommerceStats';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, commerceStatsQuerySchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canViewWebsiteSection(auth, websiteId, 'commerce'))) return unauthorized();
  const filters = await getQueryFilters(query, websiteId);
  const parameters = getCommerceRequestParameters(query, filters);

  const { startDate, endDate } = getCompareDate(
    query.compare ?? 'prev',
    parameters.startDate,
    parameters.endDate,
    new Date(),
  );
  const [stats, comparison] = await Promise.all([
    getCommerceStats(websiteId, parameters, filters),
    getCommerceStats(websiteId, { ...parameters, startDate, endDate }, filters),
  ]);

  return json({ ...stats, comparison });
}
