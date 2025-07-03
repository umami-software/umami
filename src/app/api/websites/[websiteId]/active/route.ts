import { canViewWebsite } from '@/lib/auth';
import { json, unauthorized } from '@/lib/response';
import { getActiveVisitors } from '@/queries';
import { parseRequest } from '@/lib/request';
import { z } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    pathPrefix: z.string().optional(),
    host: z.string().optional(),
  });
  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { pathPrefix, host } = query;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const result = await getActiveVisitors(websiteId, pathPrefix, host);

  return json(result);
}
