import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { getFunnel } from '@/queries';
import { reportResultSchema } from '@/lib/schema';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const {
    websiteId,
    dateRange: { startDate, endDate },
    parameters: { steps, window },
    ...filters
  } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getFunnel(websiteId, {
    ...filters,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    steps,
    windowMinutes: +window,
  });

  return json(data);
}
