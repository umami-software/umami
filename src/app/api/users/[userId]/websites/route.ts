import { z } from 'zod';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams, timezoneParam, websiteSortingParams } from '@/lib/schema';
import { getAllUserWebsitesIncludingTeamOwner, getUserWebsites } from '@/queries/prisma/website';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
    ...websiteSortingParams,
    timezone: timezoneParam.optional(),
    includeTeams: z.string().optional(),
    includeMetrics: z
      .enum(['true', 'false'])
      .transform(value => value === 'true')
      .optional(),
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { userId } = await params;

  if (!auth.user.isAdmin && auth.user.id !== userId) {
    return unauthorized();
  }

  const filters = {
    ...(await getQueryFilters(query)),
    includeMetrics: query.includeMetrics,
  };

  if (query.includeTeams) {
    return json(await getAllUserWebsitesIncludingTeamOwner(userId, filters));
  }

  return json(await getUserWebsites(userId, filters));
}
