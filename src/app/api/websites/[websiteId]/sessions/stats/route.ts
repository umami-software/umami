import { z } from 'zod';
import { parseRequest, getRequestDateRange, getRequestFilters } from '@/lib/request';
import { unauthorized, json } from '@/lib/response';
import { canViewWebsite } from '@/lib/auth';
import { filterParams } from '@/lib/schema';
import { getWebsiteSessionStats } from '@/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
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

  const { startDate, endDate } = await getRequestDateRange(query);

  const filters = getRequestFilters(query);

  const metrics = await getWebsiteSessionStats(websiteId, {
    ...filters,
    startDate,
    endDate,
  });

  const data = Object.keys(metrics[0]).reduce((obj, key) => {
    obj[key] = {
      value: Number(metrics[0][key]) || 0,
    };
    return obj;
  }, {});

  return json(data);
}
