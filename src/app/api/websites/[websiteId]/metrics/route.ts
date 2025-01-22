import { canViewWebsite, checkAuth } from 'lib/auth';
import { SESSION_COLUMNS, EVENT_COLUMNS, FILTER_COLUMNS, OPERATORS } from 'lib/constants';
import { getRequestFilters, getRequestDateRange, checkRequest } from 'lib/request';
import { getPageviewMetrics, getSessionMetrics } from 'queries';

import { z } from 'zod';
import { json, unauthorized, badRequest } from 'lib/response';

const schema = z.object({
  type: z.string(),
  startAt: z.coerce.number(),
  endAt: z.coerce.number(),
  // optional
  url: z.string().optional(),
  referrer: z.string().optional(),
  title: z.string().optional(),
  query: z.string().optional(),
  host: z.string().optional(),
  os: z.string().optional(),
  browser: z.string().optional(),
  device: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  language: z.string().optional(),
  event: z.string().optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  search: z.string().optional(),
  tag: z.string().optional(),
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
  const { type, limit, offset, search } = query;

  if (!auth || !(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { startDate, endDate } = await getRequestDateRange(query);
  const column = FILTER_COLUMNS[type] || type;
  const filters = {
    ...getRequestFilters(query),
    startDate,
    endDate,
  };

  if (search) {
    filters[type] = {
      name: type,
      column,
      operator: OPERATORS.contains,
      value: search,
    };
  }

  if (SESSION_COLUMNS.includes(type)) {
    const data = await getSessionMetrics(websiteId, type, filters, limit, offset);

    if (type === 'language') {
      const combined = {};

      for (const { x, y } of data) {
        const key = String(x).toLowerCase().split('-')[0];

        if (combined[key] === undefined) {
          combined[key] = { x: key, y };
        } else {
          combined[key].y += y;
        }
      }

      return json(Object.values(combined));
    }

    return json(data);
  }

  if (EVENT_COLUMNS.includes(type)) {
    const data = await getPageviewMetrics(websiteId, type, filters, limit, offset);

    return json(data);
  }

  return badRequest();
}
