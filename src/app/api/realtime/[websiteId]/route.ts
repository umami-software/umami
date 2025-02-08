import { json, unauthorized } from '@/lib/response';
import { getRealtimeData } from '@/queries';
import { canViewWebsite } from '@/lib/auth';
import { startOfMinute, subMinutes } from 'date-fns';
import { REALTIME_RANGE } from '@/lib/constants';
import { parseRequest } from '@/lib/request';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { timezone } = query;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const startDate = subMinutes(startOfMinute(new Date()), REALTIME_RANGE);

  const data = await getRealtimeData(websiteId, { startDate, timezone });

  return json(data);
}
