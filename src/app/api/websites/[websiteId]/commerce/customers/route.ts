import { commerceCustomersQuerySchema } from '@/lib/analytics-schema';
import { getCommerceRequestParameters } from '@/lib/commerce-reports';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsiteSection } from '@/permissions';
import { getCommerceCustomers } from '@/queries/sql/commerce/getCommerceCustomers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, commerceCustomersQuerySchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canViewWebsiteSection(auth, websiteId, 'commerce'))) return unauthorized();
  const filters = await getQueryFilters(query, websiteId);
  const parameters = getCommerceRequestParameters(query, filters);

  return json(await getCommerceCustomers(websiteId, parameters, filters));
}
