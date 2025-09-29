import { z } from 'zod';
import { pagingParams } from '@/lib/schema';
import { getAllUserWebsitesIncludingTeamOwner, getUserWebsites } from '@/queries/prisma';
import { json } from '@/lib/response';
import { parseRequest, getQueryFilters } from '@/lib/request';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
    includeTeams: z.string().optional(),
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const filters = await getQueryFilters(query);

  if (query.includeTeams) {
    return json(await getAllUserWebsitesIncludingTeamOwner(auth.user.id, filters));
  }

  return json(await getUserWebsites(auth.user.id, filters));
}
