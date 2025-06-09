import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { getInsights } from '@/queries';
import { reportResultSchema } from '@/lib/schema';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const {
    websiteId,
    dateRange: { startDate, endDate },
    fields,
    filters,
  } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getInsights(websiteId, fields, {
    ...convertFilters(filters),
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  return json(data);
}

function convertFilters(filters: any[]) {
  return filters.reduce((obj, filter) => {
    obj[filter.name] = filter;

    return obj;
  }, {});
}
