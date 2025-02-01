import { z } from 'zod';
import { canViewWebsite } from 'lib/auth';
import { unauthorized, json } from 'lib/response';
import { parseRequest } from 'lib/request';
import { reportParms, timezoneParam, unitParam } from 'lib/schema';
import { getRevenue } from 'queries/analytics/reports/getRevenue';
import { getRevenueValues } from 'queries/analytics/reports/getRevenueValues';

export async function GET(request: Request) {
  const schema = z.object({
    ...reportParms,
  });

  const { auth, query, error } = await parseRequest(request, schema);

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

export async function POST(request: Request) {
  const schema = z.object({
    websiteId: z.string().uuid(),
    dateRange: z.object({
      startDate: z.date(),
      endDate: z.date(),
      unit: unitParam,
    }),
    timezone: timezoneParam,
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const {
    websiteId,
    currency,
    timezone,
    dateRange: { startDate, endDate, unit },
  } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getRevenue(websiteId, {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    unit,
    timezone,
    currency,
  });

  return json(data);
}
