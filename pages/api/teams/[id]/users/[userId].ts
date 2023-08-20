import { canDeleteTeamUser } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteTeamUser } from 'queries';
import * as yup from 'yup';
export interface TeamUserRequestQuery {
  id: string;
  userId: string;
}

const schema = {
  DELETE: yup.object().shape({
    id: yup.string().uuid().required(),
    userId: yup.string().uuid().required(),
  }),
};

export default async (req: NextApiRequestQueryBody<TeamUserRequestQuery>, res: NextApiResponse) => {
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

  if (req.method === 'DELETE') {
    const { id: teamId, userId } = req.query;

    if (!(await canDeleteTeamUser(req.auth, teamId, userId))) {
      return unauthorized(res, 'You must be the owner of this team.');
    }

    await deleteTeamUser(teamId, userId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
