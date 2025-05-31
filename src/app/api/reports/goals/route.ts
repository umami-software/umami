import { z } from 'zod';
import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { getGoal } from '@/queries/sql/reports/getGoal';
import { filterParams, reportParms } from '@/lib/schema';

export async function POST(request: Request) {
  const schema = z
    .object({
      ...reportParms,
      ...filterParams,
      type: z.enum(['page', 'event']),
      value: z.string(),
      operator: z
        .string()
        .regex(/count|sum|average/)
        .optional(),
      property: z.string().optional(),
    })
    .refine(data => {
      if (data['type'] === 'event' && data['property']) {
        return data['operator'] && data['property'];
      }
      return true;
    });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const {
    websiteId,
    type,
    value,
    property,
    operator,
    dateRange: { startDate, endDate },
  } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getGoal(websiteId, {
    type,
    value,
    property,
    operator,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  return json(data);
}
