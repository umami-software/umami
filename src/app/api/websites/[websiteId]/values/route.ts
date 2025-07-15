import { canViewWebsite } from '@/lib/auth';
import { EVENT_COLUMNS, FILTER_COLUMNS, FILTER_GROUPS, SESSION_COLUMNS } from '@/lib/constants';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { getWebsiteSegments, getValues } from '@/queries';
import { z } from 'zod';
import { dateRangeParams, searchParams } from '@/lib/schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    type: z.string(),
    ...dateRangeParams,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { type } = query;

  if (!SESSION_COLUMNS.includes(type) && !EVENT_COLUMNS.includes(type) && !FILTER_GROUPS[type]) {
    return badRequest('Invalid type.');
  }

  let values;

  if (FILTER_GROUPS[type]) {
    values = (await getWebsiteSegments(websiteId, type)).map(segment => ({ value: segment.name }));
  } else {
    const filters = await getQueryFilters(query, websiteId);
    values = await getValues(websiteId, FILTER_COLUMNS[type], filters);
  }

  return json(values.filter(n => n).sort());
}
