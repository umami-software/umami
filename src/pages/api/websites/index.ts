import { canCreateWebsite } from 'lib/auth';
import { uuid } from 'lib/crypto';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createWebsite } from 'queries';
import userWebsites from 'pages/api/users/[id]/websites';
import * as yup from 'yup';
import { pageInfo } from 'lib/schema';

export interface WebsitesRequestQuery extends SearchFilter {}

export interface WebsitesRequestBody {
  name: string;
  domain: string;
  shareId: string;
}

const schema = {
  GET: yup.object().shape({
    ...pageInfo,
  }),
  POST: yup.object().shape({
    name: yup.string().max(100).required(),
    domain: yup.string().max(500).required(),
    shareId: yup.string().max(50).nullable(),
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
    if (!req.query.id) {
      req.query.id = userId;
    }

    if (!req.query.pageSize) {
      req.query.pageSize = 100;
    }

    return userWebsites(req as any, res);
  }

  if (req.method === 'POST') {
    const { name, domain, shareId } = req.body;

    if (!(await canCreateWebsite(req.auth))) {
      return unauthorized(res);
    }

    const data: any = {
      id: uuid(),
      name,
      domain,
      shareId,
    };

    data.userId = userId;

    const website = await createWebsite(data);

    return ok(res, website);
  }

  return methodNotAllowed(res);
};
