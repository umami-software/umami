import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { getRetention } from '@/queries';
import { reportResultSchema } from '@/lib/schema';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const {
    websiteId,
    dateRange: { startDate, endDate },
    timezone,
  } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getRetention(websiteId, {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    timezone,
  });

  return json(data);
}
