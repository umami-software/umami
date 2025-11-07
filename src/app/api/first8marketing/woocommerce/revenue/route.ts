import { canViewWebsite } from '@/permissions';
import { unauthorized, json } from '@/lib/response';
import { parseRequest, getQueryFilters, setWebsiteDate } from '@/lib/request';
import { reportResultSchema } from '@/lib/schema';
import {
  getWooCommerceRevenue,
  WooCommerceRevenueParameters,
} from '@/queries/sql/first8marketing/getWooCommerceRevenue';

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

  const data = await getWooCommerceRevenue(
    websiteId,
    parameters as WooCommerceRevenueParameters,
    filters,
  );

  return json(data);
}

