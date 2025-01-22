import { z } from 'zod';
import { canViewWebsite, checkAuth } from 'lib/auth';
import { EVENT_COLUMNS, FILTER_COLUMNS, SESSION_COLUMNS } from 'lib/constants';
import { getValues } from 'queries';
import { checkRequest, getRequestDateRange } from 'lib/request';
import { badRequest, json, unauthorized } from 'lib/response';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    type: z.string(),
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    search: z.string().optional(),
  });

  const { query, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const { websiteId } = await params;
  const { type, search } = query;
  const { startDate, endDate } = await getRequestDateRange(request);

  const auth = await checkAuth(request);

  if (!auth || !(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  if (!SESSION_COLUMNS.includes(type) && !EVENT_COLUMNS.includes(type)) {
    return badRequest();
  }

  const values = await getValues(websiteId, FILTER_COLUMNS[type], startDate, endDate, search);

  return json(values.filter(n => n).sort());
}
