import { WebsiteActive } from 'interface/api/models';
import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getActiveVisitors } from 'queries';

export interface WebsiteActiveRequestQuery {
  id: string;
}

export default async (
  req: NextApiRequestQueryBody<WebsiteActiveRequestQuery>,
  res: NextApiResponse<WebsiteActive>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const {
    user: { id: userId },
  } = req.auth;
  const { id: websiteId } = req.query;

  if (req.method === 'GET') {
    if (await canViewWebsite(userId, websiteId)) {
      return unauthorized(res);
    }

    const result = await getActiveVisitors(websiteId);

    return ok(res, result);
  }

  return methodNotAllowed(res);
};
