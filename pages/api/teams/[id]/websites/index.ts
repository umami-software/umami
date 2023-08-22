import { canViewTeam } from 'lib/auth';
import { useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter, WebsiteSearchFilterType } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getWebsites, getWebsitesByTeamId } from 'queries';
import { createTeamWebsites } from 'queries/admin/teamWebsite';

export interface TeamWebsiteRequestQuery extends SearchFilter<WebsiteSearchFilterType> {
  id: string;
}

export interface TeamWebsiteRequestBody {
  websiteIds?: string[];
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

    const { page, filter, pageSize } = req.query;

    const websites = await getWebsitesByTeamId(teamId, {
      page,
      filter,
      pageSize: +pageSize || null,
    });

    return ok(res, websites);
  }

  if (req.method === 'POST') {
    if (!(await canViewTeam(req.auth, teamId))) {
      return unauthorized(res);
    }

    const { websiteIds } = req.body;

    const websites = await createTeamWebsites(teamId, websiteIds);

    return ok(res, websites);
  }

  return methodNotAllowed(res);
};
