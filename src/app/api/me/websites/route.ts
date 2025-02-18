import { z } from 'zod';
import { pagingParams } from '@/lib/schema';
import { getUserWebsites } from '@/queries';
import { json } from '@/lib/response';
import { parseRequest } from '@/lib/request';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const websites = await getUserWebsites(auth.user.id, query);

  return json(websites);
}
