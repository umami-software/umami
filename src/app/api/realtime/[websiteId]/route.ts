import { json, unauthorized } from '@/lib/response';
import { getRealtimeData } from '@/queries';
import { canViewWebsite } from '@/lib/auth';
import { startOfMinute, subMinutes } from 'date-fns';
import { REALTIME_RANGE } from '@/lib/constants';
import { parseRequest, getQueryFilters } from '@/lib/request';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const filters = await getQueryFilters({
    ...query,
    websiteId,
    startAt: subMinutes(startOfMinute(new Date()), REALTIME_RANGE).getTime(),
    endAt: Date.now(),
  });

  const data = await getRealtimeData(websiteId, filters);

  return json(data);
}
