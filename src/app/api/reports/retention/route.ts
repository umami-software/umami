import { canViewWebsite } from '@/permissions';
import { unauthorized, json } from '@/lib/response';
import { parseRequest, getQueryFilters, setWebsiteDate } from '@/lib/request';
import { getRetention, RetentionParameters } from '@/queries/sql';
import { reportResultSchema } from '@/lib/schema';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const { websiteId } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const filters = await getQueryFilters(body.filters, websiteId);
  const parameters = await setWebsiteDate(websiteId, body.parameters);

  const data = await getRetention(websiteId, parameters as RetentionParameters, filters);

  return json(data);
}
