import { commerceBuyersQuerySchema } from '@/lib/analytics-schema';
import { getCommerceRequestParameters } from '@/lib/commerce-reports';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsiteSection } from '@/permissions';
import { getCommerceBuyers } from '@/queries/sql/commerce/getCommerceCustomers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, commerceBuyersQuerySchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canViewWebsiteSection(auth, websiteId, 'commerce'))) return unauthorized();
  // Buyers are identified visitors, so shares must also expose the Sessions section.
  if (!(await canViewWebsiteSection(auth, websiteId, 'sessions'))) return unauthorized();
  const filters = await getQueryFilters(query, websiteId);
  const parameters = getCommerceRequestParameters(query, filters);

  return json(await getCommerceBuyers(websiteId, parameters, filters));
}
