import { canViewAllWebsites } from 'lib/auth';
import { ROLES } from 'lib/constants';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { pageInfo } from 'lib/schema';
import { NextApiRequestQueryBody, PageParams } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getWebsites } from 'queries';
import * as yup from 'yup';

export interface WebsitesRequestQuery extends PageParams {
  userId?: string;
  includeOwnedTeams?: boolean;
  includeAllTeams?: boolean;
}

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

    const { userId, includeOwnedTeams, includeAllTeams } = req.query;

    const websites = await getWebsites(
      {
        where: {
          OR: [
            ...(userId && [{ userId }]),
            ...(userId && includeOwnedTeams
              ? [
                  {
                    team: {
                      deletedAt: null,
                      teamUser: {
                        some: {
                          role: ROLES.teamOwner,
                          userId,
                        },
                      },
                    },
                  },
                ]
              : []),
            ...(userId && includeAllTeams
              ? [
                  {
                    team: {
                      deletedAt: null,
                      teamUser: {
                        some: {
                          userId,
                        },
                      },
                    },
                  },
                ]
              : []),
          ],
        },
        include: {
          user: {
            select: {
              username: true,
              id: true,
            },
          },
          team: {
            where: {
              deletedAt: null,
            },
            include: {
              teamUser: {
                where: {
                  role: ROLES.teamOwner,
                },
              },
            },
          },
        },
      },
      req.query,
    );

    return ok(res, websites);
  }

  return methodNotAllowed(res);
};
