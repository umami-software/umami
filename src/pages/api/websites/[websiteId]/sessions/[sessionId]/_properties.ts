import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getSessionData } from 'queries';
import * as yup from 'yup';

export interface SessionDataRequestQuery {
  sessionId: string;
  websiteId: string;
}

const schema = {
  GET: yup.object().shape({
    sessionId: yup.string().uuid().required(),
    websiteId: yup.string().uuid().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<SessionDataRequestQuery, any>,
  res: NextApiResponse<any>,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'GET') {
    const { websiteId, sessionId } = req.query;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = await getSessionData(websiteId, sessionId);

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
