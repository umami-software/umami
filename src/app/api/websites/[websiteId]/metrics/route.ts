import { z } from 'zod';
import { canViewWebsite, checkAuth } from 'lib/auth';
import { SESSION_COLUMNS, EVENT_COLUMNS, FILTER_COLUMNS, OPERATORS } from 'lib/constants';
import { getRequestFilters, getRequestDateRange, checkRequest } from 'lib/request';
import { json, unauthorized, badRequest } from 'lib/response';
import { getPageviewMetrics, getSessionMetrics } from 'queries';
import { filterParams } from 'lib/schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    type: z.string(),
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    limit: z.coerce.number().optional(),
    offset: z.coerce.number().optional(),
    search: z.string().optional(),
    ...filterParams,
  });

  const { query, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const { websiteId } = await params;
  const { type, limit, offset, search } = query;

  const auth = await checkAuth(request);

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
