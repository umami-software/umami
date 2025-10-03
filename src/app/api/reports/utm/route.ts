import { canViewWebsite } from '@/permissions';
import { unauthorized, json } from '@/lib/response';
import { getQueryFilters, parseRequest, setWebsiteDate } from '@/lib/request';
import { getUTM, UTMParameters } from '@/queries/sql';
import { reportResultSchema } from '@/lib/schema';
import { UTM_PARAMS } from '@/lib/constants';

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

  const data = {
    utm_source: [],
    utm_medium: [],
    utm_campaign: [],
    utm_term: [],
    utm_content: [],
  };

  for (const key of UTM_PARAMS) {
    data[key] = await getUTM(websiteId, { column: key, ...parameters } as UTMParameters, filters);
  }

  return json(data);
}
