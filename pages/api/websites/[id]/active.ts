import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { getActiveVisitors } from 'queries';
import { TYPE_WEBSITE } from 'lib/constants';
import { WebsiteActive } from 'interface/api/models';
import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { NextApiResponse } from 'next';

export interface WebsiteActiveRequestQuery {
  id: string;
}

export default async (
  req: NextApiRequestQueryBody<WebsiteActiveRequestQuery>,
  res: NextApiResponse<WebsiteActive>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'GET') {
    if (!(await allowQuery(req, TYPE_WEBSITE))) {
      return unauthorized(res);
    }

    const { id: websiteId } = req.query;

    const result = await getActiveVisitors(websiteId);

    return ok(res, result);
  }

  return methodNotAllowed(res);
};
