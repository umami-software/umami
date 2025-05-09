import { canViewWebsite } from '@/lib/auth';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { reportParms } from '@/lib/schema';
import { getAttribution } from '@/queries/sql/reports/getAttribution';
import { z } from 'zod';

export async function POST(request: Request) {
  const schema = z.object({
    ...reportParms,
    model: z.string().regex(/firstClick|lastClick/i),
    steps: z
      .array(
        z.object({
          type: z.string(),
          value: z.string(),
        }),
      )
      .min(1),
    currency: z.string().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const {
    websiteId,
    model,
    steps,
    currency,
    dateRange: { startDate, endDate },
  } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getAttribution(websiteId, {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    model: model,
    steps,
    currency,
  });

  return json(data);
}
