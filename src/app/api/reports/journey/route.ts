import { canViewWebsite } from '@/permissions';
import { unauthorized, json } from '@/lib/response';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { getJourney } from '@/queries/sql';
import { reportResultSchema } from '@/lib/schema';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const { websiteId, parameters, filters } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const queryFilters = await getQueryFilters(filters, websiteId);

  const data = await getJourney(websiteId, parameters, queryFilters);

  return json(data);
}
