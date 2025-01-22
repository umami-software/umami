import { z } from 'zod';
import { checkRequest } from 'lib/request';
import { badRequest, unauthorized, json } from 'lib/response';
import { canViewWebsite, checkAuth } from 'lib/auth';
import { getEventDataFields } from 'queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    startAt: z.coerce.number().int(),
    endAt: z.coerce.number().int(),
  });

  const { query, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const { websiteId } = await params;
  const { startAt, endAt } = query;

  const auth = await checkAuth(request);

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const startDate = new Date(+startAt);
  const endDate = new Date(+endAt);

  const data = await getEventDataFields(websiteId, {
    startDate,
    endDate,
  });

  return json(data);
}
