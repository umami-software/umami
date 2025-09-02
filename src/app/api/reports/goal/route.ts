import { canViewWebsite } from '@/permissions';
import { unauthorized, json } from '@/lib/response';
import { getQueryFilters, parseRequest, setWebsiteDate } from '@/lib/request';
import { getGoal, GoalParameters } from '@/queries/sql/reports/getGoal';
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

  const parameters = await setWebsiteDate(websiteId, body.parameters);
  const filters = await getQueryFilters(body.filters, websiteId);

  const data = await getGoal(websiteId, parameters as GoalParameters, filters);

  return json(data);
}
