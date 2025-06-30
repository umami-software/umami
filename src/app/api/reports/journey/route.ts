import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { getJourney } from '@/queries';
import { reportResultSchema } from '@/lib/schema';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const {
    websiteId,
    dateRange: { startDate, endDate },
    parameters: { steps, startStep, endStep },
    ...filters
  } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getJourney(websiteId, {
    ...filters,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    steps,
    startStep,
    endStep,
  });

  return json(data);
}
