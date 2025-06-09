import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { reportResultSchema } from '@/lib/schema';
import { getRevenue } from '@/queries/sql/reports/getRevenue';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const {
    websiteId,
    currency,
    dateRange: { startDate, endDate, unit },
  } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getRevenue(websiteId, {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    unit,
    currency,
  });

  return json(data);
}
