import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { allowQuery } from 'lib/auth';
import { UmamiApi } from 'lib/constants';
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

  const { id: teamId } = req.query;

  if (req.method === 'GET') {
    if (!(await allowQuery(req, UmamiApi.AuthType.Team))) {
      return unauthorized(res);
    }

    const website = await getWebsitesByTeamId({ teamId });

    return ok(res, website);
  }

  return methodNotAllowed(res);
};
