import { canViewWebsite } from '@/lib/auth';
import { EVENT_COLUMNS, FILTER_COLUMNS, FILTER_GROUPS, SESSION_COLUMNS } from '@/lib/constants';
import { getRequestDateRange, parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { getWebsiteSegments, getValues } from '@/queries';
import { z } from 'zod';

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

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { type, search } = query;
  const { startDate, endDate } = await getRequestDateRange(query);

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  if (!SESSION_COLUMNS.includes(type) && !EVENT_COLUMNS.includes(type) && !FILTER_GROUPS[type]) {
    return badRequest('Invalid type.');
  }

  let values;

  if (FILTER_GROUPS[type]) {
    values = (await getWebsiteSegments(websiteId, type)).map(segment => ({ value: segment.name }));
  } else {
    values = await getValues(websiteId, FILTER_COLUMNS[type], startDate, endDate, search);
  }

  return json(values.filter(n => n).sort());
}
