import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { NextApiRequestQueryBody } from 'lib/types';
import { canViewTeam } from 'lib/auth';
import { useAuth } from 'lib/middleware';
import { getTeamWebsites } from 'queries/admin/team';

export interface TeamWebsiteRequestQuery {
  id: string;
}

export interface TeamWebsiteRequestBody {
  website_id: string;
  team_website_id?: string;
}

export default async (
  req: NextApiRequestQueryBody<TeamWebsiteRequestQuery, TeamWebsiteRequestBody>,
  res: NextApiResponse,
) => {
  await useAuth(req, res);

  const { id: teamId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewTeam(req.auth, teamId))) {
      return unauthorized(res);
    }

    const websites = await getTeamWebsites(teamId);

    return ok(res, websites);
  }

  return methodNotAllowed(res);
};
