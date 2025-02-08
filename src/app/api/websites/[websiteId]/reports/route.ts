import { z } from 'zod';
import { canViewWebsite } from '@/lib/auth';
import { getWebsiteReports } from '@/queries';
import { pagingParams } from '@/lib/schema';
import { parseRequest } from '@/lib/request';
import { unauthorized, json } from '@/lib/response';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { page, pageSize, search } = query;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getWebsiteReports(websiteId, {
    page: +page,
    pageSize: +pageSize,
    search,
  });

  return json(data);
}
