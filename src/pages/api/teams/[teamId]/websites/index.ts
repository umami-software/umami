import * as yup from 'yup';
import { canViewTeam } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, PageParams } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { ok, unauthorized } from 'next-basics';
import { getTeamWebsites } from 'queries';

export interface TeamWebsiteRequestQuery extends PageParams {
  teamId: string;
}

const schema = {
  GET: yup.object().shape({
    teamId: yup.string().uuid().required(),
    ...pageInfo,
  }),
};

export default async (
  req: NextApiRequestQueryBody<TeamWebsiteRequestQuery, any>,
  res: NextApiResponse,
) => {
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { teamId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewTeam(req.auth, teamId))) {
      return unauthorized(res);
    }

    const websites = await getTeamWebsites(teamId, req.query);

    return ok(res, websites);
  }
};
