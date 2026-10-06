import { commerceProductsQuerySchema } from '@/lib/analytics-schema';
import { getCommerceRequestParameters } from '@/lib/commerce-reports';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsiteSection } from '@/permissions';
import { getCommerceProducts } from '@/queries/sql/commerce/getCommerceProducts';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, commerceProductsQuerySchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canViewWebsiteSection(auth, websiteId, 'commerce'))) return unauthorized();
  const filters = await getQueryFilters(query, websiteId);
  const parameters = getCommerceRequestParameters(query, filters);

  return json(
    await getCommerceProducts(websiteId, parameters, filters, {
      groupBy: query.groupBy,
      sort: query.sort,
      minViews: query.minViews,
      maxCartRate: query.maxCartRate,
    }),
  );
}
