import { canDeleteTeamWebsite } from 'lib/auth';
import { useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteTeamWebsite } from 'queries/admin/teamWebsite';

export interface TeamWebsitesRequestQuery {
  id: string;
  websiteId: string;
}

export default async (
  req: NextApiRequestQueryBody<TeamWebsitesRequestQuery>,
  res: NextApiResponse,
) => {
  await useAuth(req, res);

  const { id: teamId, websiteId } = req.query;

  if (req.method === 'DELETE') {
    if (!(await canDeleteTeamWebsite(req.auth, teamId, websiteId))) {
      return unauthorized(res);
    }

    await deleteTeamWebsite(teamId, websiteId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
