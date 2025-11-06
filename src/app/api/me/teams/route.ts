import { z } from 'zod';
import { pagingParams } from '@/lib/schema';
import { getUserTeams } from '@/queries/prisma';
import { json } from '@/lib/response';
import { getQueryFilters, parseRequest } from '@/lib/request';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const filters = await getQueryFilters(query);

  const teams = await getUserTeams(auth.user.id, filters);

  return json(teams);
}
