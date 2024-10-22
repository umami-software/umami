import { useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter, TeamSearchFilterType } from 'lib/types';
import { getFilterValidation } from 'lib/yup';
import { NextApiResponse } from 'next';
import { methodNotAllowed } from 'next-basics';
import userTeams from 'pages/api/users/[id]/teams';
import * as yup from 'yup';

export interface MyTeamsRequestQuery extends SearchFilter<TeamSearchFilterType> {
  id: string;
}

const schema = {
  GET: yup.object().shape({
    ...getFilterValidation(/All|Name|Owner/i),
  }),
};

export default async (
  req: NextApiRequestQueryBody<MyTeamsRequestQuery, any>,
  res: NextApiResponse,
) => {
  await useCors(req, res);

  req.yup = schema;
  await useValidate(req, res);

  if (req.method === 'GET') {
    req.query.id = req.auth.user.id;

    return userTeams(req, res);
  }

  return methodNotAllowed(res);
};
