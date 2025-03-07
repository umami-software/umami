import { z } from 'zod';
import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { getJourney } from '@/queries';
import { reportParms } from '@/lib/schema';

export async function POST(request: Request) {
  const schema = z.object({
    ...reportParms,
    steps: z.coerce.number().min(3).max(7),
    startStep: z.string().optional(),
    endStep: z.string().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const {
    websiteId,
    dateRange: { startDate, endDate },
    steps,
    startStep,
    endStep,
  } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getJourney(websiteId, {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    steps,
    startStep,
    endStep,
  });

  return json(data);
}
