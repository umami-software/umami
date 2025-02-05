import { z } from 'zod';
import { unauthorized, json } from '@/lib/response';
import { canViewTeam } from '@/lib/auth';
import { parseRequest } from '@/lib/request';
import { pagingParams } from '@/lib/schema';
import { getTeamWebsites } from '@/queries';

export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const schema = z.object({
    ...pagingParams,
  });
  const { teamId } = await params;
  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!(await canViewTeam(auth, teamId))) {
    return unauthorized();
  }

  const websites = await getTeamWebsites(teamId, query);

  return json(websites);
}
