import { canUpdateUserReport, canViewUserReport } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getUserReportById, updateUserReport } from 'queries';

export interface UserReportRequestQuery {
  id: string;
}

export interface UserReportRequestBody {
  websiteId: string;
  reportName: string;
  templateName: string;
  parameters: string;
}

export default async (
  req: NextApiRequestQueryBody<UserReportRequestQuery, UserReportRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'GET') {
    const { id: userReportId } = req.query;

    const data = await getUserReportById(userReportId);

    if (!(await canViewUserReport(req.auth, data))) {
      return unauthorized(res);
    }

    return ok(res, data);
  }

  if (req.method === 'POST') {
    const { id: userReportId } = req.query;

    const data = await getUserReportById(userReportId);

    if (!(await canUpdateUserReport(req.auth, data))) {
      return unauthorized(res);
    }

    const updated = await updateUserReport(
      {
        ...req.body,
      },
      {
        id: userReportId,
      },
    );

    return ok(res, updated);
  }

  return methodNotAllowed(res);
};
