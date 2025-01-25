import { z } from 'zod';
import { unauthorized, json, badRequest } from 'lib/response';
import { canViewTeam, checkAuth } from 'lib/auth';
import { checkRequest } from 'lib/request';
import { pagingParams } from 'lib/schema';
import { getTeamWebsites } from 'queries';

export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const schema = z.object({
    ...pagingParams,
  });

  const { query, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const { teamId } = await params;

  const auth = await checkAuth(request);

  if (!auth || !(await canViewTeam(auth, teamId))) {
    return unauthorized();
  }

  const websites = await getTeamWebsites(teamId, query);

  return json(websites);
}
