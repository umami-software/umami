import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { resetWebsite } from 'queries';

export interface WebsiteResetRequestQuery {
  id: string;
}

export default async (
  req: NextApiRequestQueryBody<WebsiteResetRequestQuery>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const {
    user: { id: userId },
  } = req.auth;
  const { id: websiteId } = req.query;

  if (req.method === 'POST') {
    if (!(await canViewWebsite(userId, websiteId))) {
      return unauthorized(res);
    }

    await resetWebsite(websiteId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
