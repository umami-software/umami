import * as yup from 'yup';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, PageParams } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getSessionActivity } from 'queries';

export interface SessionActivityRequestQuery extends PageParams {
  websiteId: string;
  sessionId: string;
  startAt: number;
  endAt: number;
}

const schema = {
  GET: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    sessionId: yup.string().uuid().required(),
    startAt: yup.number().integer(),
    endAt: yup.number().integer(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<SessionActivityRequestQuery, any>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { websiteId, sessionId, startAt, endAt } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const startDate = new Date(+startAt);
    const endDate = new Date(+endAt);

    const data = await getSessionActivity(websiteId, sessionId, startDate, endDate);

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
