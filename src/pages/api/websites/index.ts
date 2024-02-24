import { canCreateTeamWebsite, canCreateWebsite } from 'lib/auth';
import { uuid } from 'lib/crypto';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createWebsite } from 'queries';
import userWebsitesRoute from 'pages/api/users/[userId]/websites';
import * as yup from 'yup';
import { pageInfo } from 'lib/schema';

export interface WebsitesRequestQuery extends SearchFilter {}

export interface WebsitesRequestBody {
  name: string;
  domain: string;
  shareId: string;
  teamId: string;
}

const schema = {
  GET: yup.object().shape({
    ...pageInfo,
  }),
  POST: yup.object().shape({
    name: yup.string().max(100).required(),
    domain: yup.string().max(500).required(),
    shareId: yup.string().max(50).nullable(),
    teamId: yup.string().nullable(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<WebsitesRequestQuery, WebsitesRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const {
    user: { id: userId },
  } = req.auth;

  if (req.method === 'GET') {
    if (!req.query.userId) {
      req.query.userId = userId;
    }

    return userWebsitesRoute(req, res);
  }

  if (req.method === 'POST') {
    const { name, domain, shareId, teamId } = req.body;

    if (
      (teamId && !(await canCreateTeamWebsite(req.auth, teamId))) ||
      !(await canCreateWebsite(req.auth))
    ) {
      return unauthorized(res);
    }

    const data: any = {
      id: uuid(),
      createdBy: userId,
      name,
      domain,
      shareId,
      teamId,
    };

    if (!teamId) {
      data.userId = userId;
    }

    const website = await createWebsite(data);

    return ok(res, website);
  }

  return methodNotAllowed(res);
};
