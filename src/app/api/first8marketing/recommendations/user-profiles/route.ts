import { canViewWebsite } from '@/permissions';
import { unauthorized, json } from '@/lib/response';
import { parseRequest, setWebsiteDate } from '@/lib/request';
import { reportResultSchema } from '@/lib/schema';
import { getUserProfiles } from '@/queries/sql/first8marketing/getUserProfiles';

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

  const data = await getUserProfiles({
    websiteId,
    startDate: new Date(parameters.startDate),
    endDate: new Date(parameters.endDate),
  });

  return json(data);
}

