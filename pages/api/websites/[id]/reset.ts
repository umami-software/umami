import { NextApiRequestQueryBody } from 'lib/types';
import { canUpdateWebsite } from 'lib/auth';
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

  const { id: websiteId } = req.query;

  if (req.method === 'POST') {
    if (!(await canUpdateWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    await resetWebsite(websiteId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
