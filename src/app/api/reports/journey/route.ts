import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { getQueryFilters, parseRequest, setWebsiteDate } from '@/lib/request';
import { getJourney } from '@/queries';
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

  const queryFilters = await setWebsiteDate(websiteId, getQueryFilters(filters));

  const data = await getJourney(websiteId, parameters, queryFilters);

  return json(data);
}
