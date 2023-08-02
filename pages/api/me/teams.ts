import { useCors } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed } from 'next-basics';
import userTeams from 'pages/api/users/[id]/teams';

export default async (req: NextApiRequestQueryBody, res: NextApiResponse) => {
  await useCors(req, res);

  if (req.method === 'GET') {
    return userTeams(req, res);
  }

  return methodNotAllowed(res);
};
