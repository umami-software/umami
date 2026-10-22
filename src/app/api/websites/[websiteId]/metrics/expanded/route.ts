import { z } from 'zod';
import { EVENT_COLUMNS, EVENT_TYPE, SESSION_COLUMNS } from '@/lib/constants';
import { fetchQuery } from '@/lib/queryCache';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { filterParams, searchParams, withDateRange } from '@/lib/schema';
import { canViewWebsiteSection } from '@/permissions';
import {
  getChannelExpandedMetrics,
  getEventExpandedMetrics,
  getPageviewExpandedMetrics,
  getSessionExpandedMetrics,
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

  if (!(await canViewWebsiteSection(auth, websiteId, ['overview', 'compare']))) {
    return unauthorized();
  }

  const { type, limit, offset, search } = query;
  const filters = await getQueryFilters(query, websiteId);

  if (search) {
    filters[type] = `c.${search}`;
  }

  if (SESSION_COLUMNS.includes(type)) {
    const data = await fetchQuery(websiteId, 'metrics-expanded', query, filters.endDate, () => getSessionExpandedMetrics(websiteId, { type, limit, offset }, filters));

    return json(data);
  }

  if (EVENT_COLUMNS.includes(type)) {
    if (type === 'event') {
      filters.eventType = EVENT_TYPE.customEvent;
      return json(await fetchQuery(websiteId, 'metrics-expanded', query, filters.endDate, () => getEventExpandedMetrics(websiteId, { type, limit, offset }, filters)));
    } else {
      return json(await fetchQuery(websiteId, 'metrics-expanded', query, filters.endDate, () => getPageviewExpandedMetrics(websiteId, { type, limit, offset }, filters)));
    }
  }

  if (type === 'channel') {
    return json(await fetchQuery(websiteId, 'metrics-expanded', query, filters.endDate, () => getChannelExpandedMetrics(websiteId, filters)));
  }

  return badRequest();
}
