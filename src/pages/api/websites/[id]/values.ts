import { NextApiRequestQueryBody } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { EVENT_COLUMNS, FILTER_COLUMNS, SESSION_COLUMNS } from 'lib/constants';
import { getValues } from 'queries';

export interface WebsiteResetRequestQuery {
  id: string;
}

import * as yup from 'yup';
const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<WebsiteResetRequestQuery>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

  const { id: websiteId, type } = req.query;

  if (req.method === 'GET') {
    if (!SESSION_COLUMNS.includes(type as string) && !EVENT_COLUMNS.includes(type as string)) {
      return badRequest(res);
    }

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const values = await getValues(websiteId, FILTER_COLUMNS[type as string]);

    return ok(
      res,
      values
        .map(({ value }) => value)
        .filter(n => n)
        .sort(),
    );
  }

  return methodNotAllowed(res);
};
