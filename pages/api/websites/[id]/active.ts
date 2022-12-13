import { NextApiRequestQueryBody, WebsiteActive } from 'lib/types';
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

  const { user, shareToken } = req.auth;
  const userId = user?.id;
  const websiteId = req.query.id;
  const shared = shareToken?.websiteId === websiteId;

  if (req.method === 'GET') {
    const canView = await canViewWebsite(userId, websiteId);

    if (!canView && !shared) {
      return unauthorized(res);
    }

    const result = await getActiveVisitors(websiteId);

    return ok(res, result);
  }

  return methodNotAllowed(res);
};
