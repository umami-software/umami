import { z } from 'zod';
import { unauthorized, json } from '@/lib/response';
import { getAllUserWebsitesIncludingTeamOwner, getUserWebsites } from '@/queries/prisma/website';
import { pagingParams, searchParams } from '@/lib/schema';
import { getQueryFilters, parseRequest } from '@/lib/request';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
    includeTeams: z.string().optional(),
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { userId } = await params;

  if (!auth.user.isAdmin && auth.user.id !== userId) {
    return unauthorized();
  }

  const filters = await getQueryFilters(query);

  if (query.includeTeams) {
    return json(await getAllUserWebsitesIncludingTeamOwner(auth.user.id, filters));
  }

  return json(await getUserWebsites(userId, filters));
}
