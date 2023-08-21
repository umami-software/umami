import { WebsiteActive, NextApiRequestQueryBody } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getWebsiteDateRange } from 'queries';
import * as yup from 'yup';

export interface WebsiteDateRangeRequestQuery {
  id: string;
}

const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<WebsiteDateRangeRequestQuery>,
  res: NextApiResponse<WebsiteActive>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

  const { id: websiteId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const result = await getWebsiteDateRange(websiteId);

    return ok(res, result);
  }

  return methodNotAllowed(res);
};
