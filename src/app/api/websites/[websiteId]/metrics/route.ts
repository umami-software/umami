import { z } from 'zod';
import { EVENT_COLUMNS, EVENT_TYPE, SESSION_COLUMNS } from '@/lib/constants';
import { fetchQuery } from '@/lib/queryCache';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { filterParams, searchParams, withDateRange } from '@/lib/schema';
import { canViewWebsiteSection } from '@/permissions';
import {
  getChannelMetrics,
  getEventMetrics,
  getPageviewMetrics,
  getSessionMetrics,
} from '@/queries/sql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = withDateRange({
    type: z.string(),
    limit: z.coerce.number().optional(),
    offset: z.coerce.number().optional(),
    ...searchParams,
    ...filterParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (
    !(await canViewWebsiteSection(auth, websiteId, [
      'overview',
      'events',
      'sessions',
      'compare',
      'breakdown',
      'utm',
      'attribution',
    ]))
  ) {
    return unauthorized();
  }

  const { type, limit, offset, search } = query;
  const filters = await getQueryFilters(query, websiteId);

  if (search) {
    filters[type] = `c.${search}`;
  }

  const result = await fetchQuery(websiteId, 'metrics', query, filters.endDate, async () => {
    if (SESSION_COLUMNS.includes(type)) {
      return getSessionMetrics(websiteId, { type, limit, offset }, filters);
    }

    if (EVENT_COLUMNS.includes(type)) {
      if (type === 'event') {
        filters.eventType = EVENT_TYPE.customEvent;
        return getEventMetrics(websiteId, { type, limit, offset }, filters);
      } else {
        return getPageviewMetrics(websiteId, { type, limit, offset }, filters);
      }
    }

    if (type === 'channel') {
      return getChannelMetrics(websiteId, filters);
    }

    return null;
  });

  if (result === null) {
    return badRequest();
  }

  return json(result);
}
