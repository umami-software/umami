import { canAddUserToTeam, canViewTeam } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { pageInfo } from 'lib/schema';
import { NextApiRequestQueryBody, PageParams } from 'lib/types';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createTeamUser, getTeamUser, getTeamUsers } from 'queries';
import * as yup from 'yup';

export interface TeamUserRequestQuery extends PageParams {
  teamId: string;
}

export interface TeamUserRequestBody {
  userId: string;
  role: string;
}

const schema = {
  GET: yup.object().shape({
    teamId: yup.string().uuid().required(),
    ...pageInfo,
  }),
  POST: yup.object().shape({
    userId: yup.string().uuid().required(),
    role: yup
      .string()
      .matches(/team-member|team-view-only|team-manager/i)
      .required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<TeamUserRequestQuery, TeamUserRequestBody>,
  res: NextApiResponse,
) => {
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { teamId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewTeam(req.auth, teamId))) {
      return unauthorized(res);
    }

    const users = await getTeamUsers(
      {
        where: {
          teamId,
          user: {
            deletedAt: null,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      req.query,
    );

    return ok(res, users);
  }

  // admin function only
  if (req.method === 'POST') {
    if (!(await canAddUserToTeam(req.auth))) {
      return unauthorized(res);
    }

    const { userId, role } = req.body;

    const teamUser = await getTeamUser(teamId, userId);

    if (teamUser) {
      return badRequest(res, 'User is already a member of the Team.');
    }

    const users = await createTeamUser(userId, teamId, role);

    return ok(res, users);
  }

  return methodNotAllowed(res);
};
