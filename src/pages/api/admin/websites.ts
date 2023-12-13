import { canViewAllWebsites } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getWebsites } from 'queries';
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

  if (req.method === 'GET') {
    if (!(await canViewAllWebsites(req.auth))) {
      return unauthorized(res);
    }

    const websites = await getWebsites(req.query, {
      include: {
        teamWebsite: {
          include: {
            team: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    });

    return ok(res, websites);
  }

  return methodNotAllowed(res);
};
