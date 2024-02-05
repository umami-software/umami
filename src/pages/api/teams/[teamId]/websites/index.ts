import * as yup from 'yup';
import { canViewTeam } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { ok, unauthorized } from 'next-basics';
import { getTeamWebsites } from 'queries';

export interface TeamWebsiteRequestQuery extends SearchFilter {
  teamId: string;
}

export interface TeamWebsiteRequestBody {
  name: string;
  domain: string;
  shareId: string;
}

const schema = {
  GET: yup.object().shape({
    teamId: yup.string().uuid().required(),
    ...pageInfo,
  }),
  POST: yup.object().shape({
    name: yup.string().max(100).required(),
    domain: yup.string().max(500).required(),
    shareId: yup.string().max(50).nullable(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<TeamWebsiteRequestQuery, TeamWebsiteRequestBody>,
  res: NextApiResponse,
) => {
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { teamId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewTeam(req.auth, teamId))) {
      return unauthorized(res);
    }

    const { page, query, pageSize } = req.query;

    const websites = await getTeamWebsites(teamId, {
      page,
      query,
      pageSize,
    });

    return ok(res, websites);
  }
};
