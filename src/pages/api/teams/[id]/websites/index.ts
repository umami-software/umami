import * as yup from 'yup';
import { canCreateTeamWebsite, canViewTeam } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { pageInfo } from 'lib/schema';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createWebsite, getWebsitesByTeamId } from 'queries';
import { uuid } from 'lib/crypto';

export interface TeamWebsiteRequestQuery extends SearchFilter {
  id: string;
}

export interface TeamWebsiteRequestBody {
  name: string;
  domain: string;
  shareId: string;
}

const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
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
    if (!(await canCreateTeamWebsite(req.auth, teamId))) {
      return unauthorized(res);
    }

    const { name, domain, shareId } = req.body;

    const website = await createWebsite({ id: uuid(), name, domain, shareId });

    return ok(res, website);
  }

  return methodNotAllowed(res);
};
