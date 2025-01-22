import { z } from 'zod';
import { canViewWebsite, checkAuth } from 'lib/auth';
import { EVENT_COLUMNS, FILTER_COLUMNS, SESSION_COLUMNS } from 'lib/constants';
import { getValues } from 'queries';
import { checkRequest, getRequestDateRange } from 'lib/request';
import { badRequest, json, unauthorized } from 'lib/response';

const schema = z.object({
  type: z.string(),
  startAt: z.coerce.number(),
  endAt: z.coerce.number(),
  search: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { query, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const auth = await checkAuth(request);
  const { websiteId } = await params;
  const { type, search } = query;
  const { startDate, endDate } = await getRequestDateRange(request);

  if (!auth || !(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  if (!SESSION_COLUMNS.includes(type) && !EVENT_COLUMNS.includes(type)) {
    return badRequest();
  }

  const values = await getValues(websiteId, FILTER_COLUMNS[type], startDate, endDate, search);

  return json(values.filter(n => n).sort());
}
