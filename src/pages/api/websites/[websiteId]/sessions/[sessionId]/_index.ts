import * as yup from 'yup';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, PageParams } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getWebsiteSession } from 'queries';

export interface WesiteSessionRequestQuery extends PageParams {
  websiteId: string;
  sessionId: string;
}

const schema = {
  GET: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    sessionId: yup.string().uuid().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<WesiteSessionRequestQuery, any>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { websiteId, sessionId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = await getWebsiteSession(websiteId, sessionId);

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
