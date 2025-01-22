import { z } from 'zod';
import { checkRequest, getRequestDateRange, getRequestFilters } from 'lib/request';
import { badRequest, unauthorized, json } from 'lib/response';
import { canViewWebsite, checkAuth } from 'lib/auth';
import { filterParams } from 'lib/schema';
import { getWebsiteSessionStats } from 'queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    ...filterParams,
  });

  const { error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const { websiteId } = await params;

  const auth = await checkAuth(request);

  if (!auth || !(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { startDate, endDate } = await getRequestDateRange(request);

  const filters = getRequestFilters(request);

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
