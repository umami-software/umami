import { Team } from '@prisma/client';
import { canDeleteTeam, canUpdateTeam, canViewTeam } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteTeam, getTeamById, updateTeam } from 'queries';
import * as yup from 'yup';

export interface TeamRequestQuery {
  id: string;
}

export interface TeamRequestBody {
  name: string;
  accessCode: string;
}

const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
  }),
  POST: yup.object().shape({
    id: yup.string().uuid().required(),
    name: yup.string().max(50),
    accessCode: yup.string().max(50),
  }),
  DELETE: yup.object().shape({
    id: yup.string().uuid().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<TeamRequestQuery, TeamRequestBody>,
  res: NextApiResponse<Team>,
) => {
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

  const { id: teamId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewTeam(req.auth, teamId))) {
      return unauthorized(res);
    }

    const user = await getTeamById(teamId, { includeTeamUser: true });

    return ok(res, user);
  }

  if (req.method === 'POST') {
    if (!(await canUpdateTeam(req.auth, teamId))) {
      return unauthorized(res, 'You must be the owner of this team.');
    }

    const { name, accessCode } = req.body;
    const data = { name, accessCode };

    const updated = await updateTeam(teamId, data);

    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    if (!(await canDeleteTeam(req.auth, teamId))) {
      return unauthorized(res, 'You must be the owner of this team.');
    }

    await deleteTeam(teamId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
