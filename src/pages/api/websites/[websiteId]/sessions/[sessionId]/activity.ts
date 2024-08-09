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
  startDate: string;
  endDate: string;
}

const schema = {
  GET: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    sessionId: yup.string().uuid().required(),
    startDate: yup.string().required(),
    endDate: yup.string().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<SessionActivityRequestQuery, any>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { websiteId, sessionId, startDate, endDate } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = await getSessionActivity(
      websiteId,
      sessionId,
      new Date(startDate),
      new Date(endDate),
    );

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
