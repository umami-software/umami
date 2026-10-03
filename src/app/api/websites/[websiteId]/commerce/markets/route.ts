import { commerceChartQuerySchema } from '@/lib/analytics-schema';
import { getCommerceRequestParameters } from '@/lib/commerce-reports';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsiteSection } from '@/permissions';
import { getCommerceMarkets } from '@/queries/sql/commerce/getCommerceMarkets';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, commerceChartQuerySchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canViewWebsiteSection(auth, websiteId, 'commerce'))) return unauthorized();
  const filters = await getQueryFilters(query, websiteId);
  return json(
    await getCommerceMarkets(websiteId, getCommerceRequestParameters(query, filters), filters),
  );
}
