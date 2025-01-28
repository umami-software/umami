import { z } from 'zod';
import { canViewWebsite } from 'lib/auth';
import { unauthorized, json } from 'lib/response';
import { parseRequest } from 'lib/request';
import { getFunnel } from 'queries';

export async function POST(request: Request) {
  const schema = z.object({
    websiteId: z.string().uuid(),
    steps: z
      .array(
        z.object({
          type: z.string(),
          value: z.string(),
        }),
      )
      .min(2),
    window: z.number().positive(),
    dateRange: z.object({
      startDate: z.date(),
      endDate: z.date(),
    }),
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
