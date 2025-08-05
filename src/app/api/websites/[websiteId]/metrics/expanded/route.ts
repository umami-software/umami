import { canViewWebsite } from '@/lib/auth';
import { EVENT_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { dateRangeParams, filterParams, searchParams } from '@/lib/schema';
import {
  getChannelMetrics,
  getEventMetrics,
  getPageviewMetrics,
  getSessionExpandedMetrics,
} from '@/queries';
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

    // if (type === 'language') {
    //   const combined = {};

    //   for (const { x, y } of data) {
    //     const key = String(x).toLowerCase().split('-')[0];

    //     if (combined[key] === undefined) {
    //       combined[key] = { x: key, y };
    //     } else {
    //       combined[key].y += y;
    //     }
    //   }

    //   return json(Object.values(combined));
    // }

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
