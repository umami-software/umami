import { NextApiRequestAuth } from 'lib/types';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { ok } from 'next-basics';
import { getUserTeams } from 'queries/admin/team';

export default async (req: NextApiRequestAuth, res: NextApiResponse) => {
  await useAuth(req, res);

  const { user } = req.auth;

  const teams = await getUserTeams(user.id);

  user['teams'] = teams.data.map(n => n);

  return ok(res, user);
};
