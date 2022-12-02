import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { canViewTeam } from 'lib/auth';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getWebsitesByTeamId } from 'queries';

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

  const {
    user: { id: userId },
  } = req.auth;
  const { id: teamId } = req.query;

  if (req.method === 'GET') {
    if (await canViewTeam(userId, teamId)) {
      return unauthorized(res);
    }

    const website = await getWebsitesByTeamId({ teamId });

    return ok(res, website);
  }

  return methodNotAllowed(res);
};
