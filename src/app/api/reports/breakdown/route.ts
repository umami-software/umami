import { getQueryFilters, parseRequest, setWebsiteDate } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { reportResultSchema } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import { type BreakdownParameters, getBreakdown } from '@/queries/sql';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const { websiteId } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const parameters = await setWebsiteDate(websiteId, auth.user.id, body.parameters);
  const filters = await getQueryFilters(body.filters, websiteId, auth.user.id);

  const data = await getBreakdown(websiteId, parameters as BreakdownParameters, filters);

  return json(data);
}
