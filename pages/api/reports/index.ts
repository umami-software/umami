import { uuid } from 'lib/crypto';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok } from 'next-basics';
import { createUserReport, getUserReports } from 'queries';

export interface UserReportRequestBody {
  websiteId: string;
  reportName: string;
  templateName: string;
  parameters: string;
}

export default async (
  req: NextApiRequestQueryBody<any, UserReportRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const {
    user: { id: userId },
  } = req.auth;

  if (req.method === 'GET') {
    const data = await getUserReports(userId);

    return ok(res, data);
  }

  if (req.method === 'POST') {
    const data = await createUserReport({
      id: uuid(),
      userId,
      ...req.body,
    });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
