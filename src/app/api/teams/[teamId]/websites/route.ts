import { z } from 'zod';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams, timezoneParam, websiteSortingParams } from '@/lib/schema';
import { canViewTeam } from '@/permissions';
import { getTeamWebsites } from '@/queries/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
    ...websiteSortingParams,
    timezone: timezoneParam.optional(),
    includeMetrics: z
      .enum(['true', 'false'])
      .transform(value => value === 'true')
      .optional(),
  });
  const { teamId } = await params;
  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!(await canViewTeam(auth, teamId))) {
    return unauthorized();
  }

  const filters = {
    ...(await getQueryFilters(query)),
    includeMetrics: query.includeMetrics,
  };

  const websites = await getTeamWebsites(teamId, filters);

  return json(websites);
}
