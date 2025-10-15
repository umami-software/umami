import { parseRequest } from '@/lib/request';
import { unauthorized, json } from '@/lib/response';
import { canViewWebsite } from '@/permissions';
import { getEventData } from '@/queries/sql/events/getEventData';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; eventId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, eventId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getEventData(websiteId, eventId);

  return json(data);
}
