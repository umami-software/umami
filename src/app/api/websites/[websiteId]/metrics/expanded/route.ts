import { EVENT_COLUMNS, EVENT_TYPE, SESSION_COLUMNS } from '@/lib/constants';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { dateRangeParams, filterParams, searchParams } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import {
  getChannelExpandedMetrics,
  getEventExpandedMetrics,
  getPageviewExpandedMetrics,
  getSessionExpandedMetrics,
} from '@/queries/sql';
import { z } from 'zod';

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
    const data = await getSessionExpandedMetrics(websiteId, { type, limit, offset }, filters);

    return json(data);
  }

  if (EVENT_COLUMNS.includes(type)) {
    if (type === 'event') {
      filters.eventType = EVENT_TYPE.customEvent;
      return json(await getEventExpandedMetrics(websiteId, { type, limit, offset }, filters));
    } else {
      return json(await getPageviewExpandedMetrics(websiteId, { type, limit, offset }, filters));
    }
  }

  if (type === 'channel') {
    return json(await getChannelExpandedMetrics(websiteId, filters));
  }

  return badRequest();
}
