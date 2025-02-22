import { z } from 'zod';
import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { getGoals } from '@/queries/sql/reports/getGoals';
import { reportParms } from '@/lib/schema';

export async function POST(request: Request) {
  const schema = z.object({
    ...reportParms,
    goals: z
      .array(
        z
          .object({
            type: z.string().regex(/url|event|event-data/),
            value: z.string(),
            goal: z.coerce.number(),
            operator: z
              .string()
              .regex(/count|sum|average/)
              .optional(),
            property: z.string().optional(),
          })
          .refine(data => {
            if (data['type'] === 'event-data') {
              return data['operator'] && data['property'];
            }
            return true;
          }),
      )
      .min(1),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const {
    websiteId,
    dateRange: { startDate, endDate },
    goals,
  } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getGoals(websiteId, {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    goals,
  });

  return json(data);
}
