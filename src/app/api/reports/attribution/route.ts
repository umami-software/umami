import { z } from 'zod';
import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { getFunnel } from '@/queries';
import { reportParms } from '@/lib/schema';

export async function POST(request: Request) {
  const schema = z.object({
    ...reportParms,
    window: z.coerce.number().positive(),
    steps: z
      .array(
        z.object({
          type: z.string(),
          value: z.string(),
        }),
      )
      .min(2),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const {
    websiteId,
    steps,
    window,
    dateRange: { startDate, endDate },
  } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getFunnel(websiteId, {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    steps,
    windowMinutes: +window,
  });

  return json(data);
}
