import { useCors } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter, TeamSearchFilterType } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed } from 'next-basics';
import userTeams from 'pages/api/users/[id]/teams';

export interface MyTeamsRequestQuery extends SearchFilter<TeamSearchFilterType> {}

export default async (
  req: NextApiRequestQueryBody<MyTeamsRequestQuery, any>,
  res: NextApiResponse,
) => {
  await useCors(req, res);

  if (req.method === 'GET') {
    return userTeams(req, res);
  }

  return methodNotAllowed(res);
};
