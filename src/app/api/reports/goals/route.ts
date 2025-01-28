import { z } from 'zod';
import { canViewWebsite } from 'lib/auth';
import { unauthorized, json } from 'lib/response';
import { parseRequest } from 'lib/request';
import { getGoals } from 'queries/analytics/reports/getGoals';

export async function POST(request: Request) {
  const schema = z.object({
    websiteId: z.string().uuid(),
    dateRange: z.object({
      startDate: z.date(),
      endDate: z.date(),
    }),
    goals: z
      .array(
        z.object({
          type: z.string().regex(/url|event|event-data/),
          value: z.string(),
          goal: z.number(),
          operator: z
            .string()
            .regex(/count|sum|average/)
            .refine(data => data['type'] === 'event-data'),
          property: z.string().refine(data => data['type'] === 'event-data'),
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
