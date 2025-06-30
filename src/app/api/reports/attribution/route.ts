import { canViewWebsite } from '@/lib/auth';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { reportResultSchema } from '@/lib/schema';
import { getAttribution } from '@/queries/sql/reports/getAttribution';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const {
    websiteId,
    dateRange: { startDate, endDate },
    parameters: { model, type, step, currency },
    ...filters
  } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getAttribution(websiteId, {
    ...filters,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    model,
    type,
    step,
    currency,
  });

  return json(data);
}
