import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { uuid } from 'lib/crypto';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok } from 'next-basics';
import { createTeamWebsite, deleteTeamWebsite, getWebsitesByTeamId } from 'queries';

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
    const website = await getWebsitesByTeamId({ teamId });

    return ok(res, website);
  }

  if (req.method === 'POST') {
    const { website_id: websiteId } = req.body;

    const updated = await createTeamWebsite({ id: uuid(), websiteId, teamId });

    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    const { team_website_id } = req.body;

    await deleteTeamWebsite(team_website_id);

    return ok(res);
  }

  return methodNotAllowed(res);
};
