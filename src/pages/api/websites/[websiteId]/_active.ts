import { WebsiteActive, NextApiRequestQueryBody } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getActiveVisitors } from 'queries';
import * as yup from 'yup';

export interface WebsiteActiveRequestQuery {
  websiteId: string;
}

const schema = {
  GET: yup.object().shape({
    websiteId: yup.string().uuid().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<WebsiteActiveRequestQuery>,
  res: NextApiResponse<WebsiteActive>,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { websiteId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId as string))) {
      return unauthorized(res);
    }

    const result = await getActiveVisitors(websiteId as string);

    return ok(res, result);
  }

  return methodNotAllowed(res);
};
