import { EVENT_COLUMNS, EVENT_TYPE, SESSION_COLUMNS } from '@/lib/constants';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { dateRangeParams, filterParams, searchParams } from '@/lib/schema';
import { canViewWebsite } from '@/permissions';
import {
  getChannelMetrics,
  getEventMetrics,
  getPageviewMetrics,
  getSessionMetrics,
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
  // Map 'url' to 'path' for backward compatibility
  const metricType = type === 'url' ? 'path' : type;
  const filters = await getQueryFilters(query, websiteId);

  if (search) {
    filters[metricType] = `c.${search}`;
  }

  if (SESSION_COLUMNS.includes(metricType)) {
    const data = await getSessionMetrics(websiteId, { type: metricType, limit, offset }, filters);

    return json(data);
  }

  if (EVENT_COLUMNS.includes(metricType)) {
    if (metricType === 'event') {
      filters.eventType = EVENT_TYPE.customEvent;
      return json(await getEventMetrics(websiteId, { type: metricType, limit, offset }, filters));
    } else {
      return json(await getPageviewMetrics(websiteId, { type: metricType, limit, offset }, filters));
    }
  }

  if (metricType === 'channel') {
    return json(await getChannelMetrics(websiteId, filters));
  }

  return badRequest();
}
