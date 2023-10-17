import * as yup from 'yup';
import { canViewTeam } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getWebsitesByTeamId } from 'queries';
import { createTeamWebsites } from 'queries/admin/teamWebsite';

export interface TeamWebsiteRequestQuery extends SearchFilter {
  id: string;
}

export interface TeamWebsiteRequestBody {
  websiteIds?: string[];
}

const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
    ...pageInfo,
  }),
  POST: yup.object().shape({
    id: yup.string().uuid().required(),
    websiteIds: yup.array().of(yup.string()).min(1).required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<TeamWebsiteRequestQuery, TeamWebsiteRequestBody>,
  res: NextApiResponse,
) => {
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { id: teamId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewTeam(req.auth, teamId))) {
      return unauthorized(res);
    }

    const { page, query, pageSize } = req.query;

    const websites = await getWebsitesByTeamId(teamId, {
      page,
      query,
      pageSize: +pageSize || undefined,
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
