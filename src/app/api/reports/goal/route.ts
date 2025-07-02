import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { getGoal } from '@/queries/sql/reports/getGoal';
import { reportResultSchema } from '@/lib/schema';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const {
    websiteId,
    dateRange: { startDate, endDate },
    parameters: { type, value, property, operator },
  } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const filters = await getQueryFilters(body.filters);

  const data = await getGoal(websiteId, {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    type,
    value,
    property,
    operator,
    filters,
  });

  return json(data);
}
