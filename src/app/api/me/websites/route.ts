import { z } from 'zod';
import { pagingParams } from '@/lib/schema';
import { getUserWebsites } from '@/queries';
import { json } from '@/lib/response';
import { parseRequest, getQueryFilters } from '@/lib/request';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const filters = await getQueryFilters(query);

  const websites = await getUserWebsites(auth.user.id, filters);

  return json(websites);
}
