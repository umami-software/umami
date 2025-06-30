import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { parseRequest } from '@/lib/request';
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
    ...filters
  } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getGoal(websiteId, {
    ...filters,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    type,
    value,
    property,
    operator,
  });

  return json(data);
}
