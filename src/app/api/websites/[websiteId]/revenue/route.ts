import { z } from 'zod';
import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { getRequestDateRange, parseRequest } from '@/lib/request';
import { filterParams, unitParam, timezoneParam } from '@/lib/schema';
import { getRevenue } from '@/queries/sql/reports/getRevenue';
import { getRevenueValues } from '@/queries/sql/reports/getRevenueValues';

export async function __GET(request: Request) {
  const { auth, query, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, startDate, endDate } = query;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getRevenueValues(websiteId, {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  return json(data);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    currency: z.string(),
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
    unit: unitParam,
    timezone: timezoneParam,
    ...filterParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { currency, timezone, unit } = query;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { startDate, endDate } = await getRequestDateRange(query);

  const data = await getRevenue(websiteId, {
    startDate,
    endDate,
    unit,
    timezone,
    currency,
  });

  return json(data);
}
