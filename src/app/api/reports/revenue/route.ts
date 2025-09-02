import { canViewWebsite } from '@/permissions';
import { unauthorized, json } from '@/lib/response';
import { parseRequest, getQueryFilters, setWebsiteDate } from '@/lib/request';
import { reportResultSchema } from '@/lib/schema';
import { getRevenue, RevenuParameters } from '@/queries/sql/reports/getRevenue';

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

  const data = await getRevenue(websiteId, parameters as RevenuParameters, filters);

  return json(data);
}
