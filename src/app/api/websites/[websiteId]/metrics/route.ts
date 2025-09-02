import { canViewWebsite } from '@/permissions';
import { EVENT_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import {
  getChannelMetrics,
  getEventMetrics,
  getPageviewMetrics,
  getSessionMetrics,
} from '@/queries';
import { z } from 'zod';
import { dateRangeParams, filterParams, searchParams } from '@/lib/schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    type: z.string(),
    limit: z.coerce.number().optional(),
    offset: z.coerce.number().optional(),
    ...dateRangeParams,
    ...searchParams,
    ...filterParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { type, limit, offset, search } = query;
  const filters = await getQueryFilters(query, websiteId);

  if (search) {
    filters[type] = `c.${search}`;
  }

  if (SESSION_COLUMNS.includes(type)) {
    const data = await getSessionMetrics(websiteId, { type, limit, offset }, filters);

    return json(data);
  }

  if (EVENT_COLUMNS.includes(type)) {
    let data;

    if (type === 'event') {
      data = await getEventMetrics(websiteId, { type, limit, offset }, filters);
    } else {
      data = await getPageviewMetrics(websiteId, { type, limit, offset }, filters);
    }

    return json(data);
  }

  if (type === 'channel') {
    const data = await getChannelMetrics(websiteId, filters);

    return json(data);
  }

  return badRequest();
}
