import { Team } from '@prisma/client';
import { ROLES } from 'lib/constants';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, notFound, ok } from 'next-basics';
import { createTeamUser, getTeamByAccessCode, getTeamUser } from 'queries';
import * as yup from 'yup';
export interface TeamsJoinRequestBody {
  accessCode: string;
}

const schema = {
  POST: yup.object().shape({
    accessCode: yup.string().max(50).required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<any, TeamsJoinRequestBody>,
  res: NextApiResponse<Team>,
) => {
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

  if (req.method === 'POST') {
    const { accessCode } = req.body;

    const team = await getTeamByAccessCode(accessCode);

    if (!team) {
      return notFound(res, 'message.team-not-found');
    }

    const teamUser = await getTeamUser(team.id, req.auth.user.id);

    if (teamUser) {
      return methodNotAllowed(res, 'message.team-already-member');
    }

    await createTeamUser(req.auth.user.id, team.id, ROLES.teamMember);

    return ok(res, team);
  }

  return methodNotAllowed(res);
};
