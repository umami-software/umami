import { z } from 'zod';
import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { getUTM } from '@/queries';
import { reportParms } from '@/lib/schema';

export async function POST(request: Request) {
  const schema = z.object({
    ...reportParms,
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const {
    websiteId,
    dateRange: { startDate, endDate, timezone },
  } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getUTM(websiteId, {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    timezone,
  });

  return json(data);
}
