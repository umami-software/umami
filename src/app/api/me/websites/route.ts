import { z } from 'zod';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json } from '@/lib/response';
import { pagingParams, searchParams, timezoneParam, websiteSortingParams } from '@/lib/schema';
import { getAllUserWebsitesIncludingTeamOwner, getUserWebsites } from '@/queries/prisma';

export async function GET(request: Request) {
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

  const filters = {
    ...(await getQueryFilters(query)),
    includeMetrics: query.includeMetrics,
  };

  if (query.includeTeams) {
    return json(await getAllUserWebsitesIncludingTeamOwner(auth.user.id, filters));
  }

  return json(await getUserWebsites(auth.user.id, filters));
}
