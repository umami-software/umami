import { canDeleteTeamWebsite } from 'lib/auth';
import { useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteTeamWebsite } from 'queries/admin/teamWebsite';

export interface TeamWebsiteRequestQuery {
  id: string;
}

export default async (
  req: NextApiRequestQueryBody<TeamWebsiteRequestQuery>,
  res: NextApiResponse,
) => {
  await useAuth(req, res);

  const { id: teamWebsiteId } = req.query;

  if (req.method === 'DELETE') {
    if (!(await canDeleteTeamWebsite(req.auth, teamWebsiteId))) {
      return unauthorized(res);
    }

    const websites = await deleteTeamWebsite(teamWebsiteId);

    return ok(res, websites);
  }

  return methodNotAllowed(res);
};
