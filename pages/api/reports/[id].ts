import { canUpdateReport, canViewReport } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getReportById, updateReport } from 'queries';

export interface ReportRequestQuery {
  id: string;
}

export interface ReportRequestBody {
  websiteId: string;
  type: string;
  name: string;
  description: string;
  parameters: string;
}

export default async (
  req: NextApiRequestQueryBody<ReportRequestQuery, ReportRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'GET') {
    const { id: reportId } = req.query;

    const data = await getReportById(reportId);

    if (!(await canViewReport(req.auth, data))) {
      return unauthorized(res);
    }

    data.parameters = JSON.parse(data.parameters);

    return ok(res, data);
  }

  if (req.method === 'POST') {
    const { id: reportId } = req.query;
    const {
      user: { id: userId },
    } = req.auth;

    const { websiteId, type, name, description, parameters } = req.body;

    const data = await getReportById(reportId);

    if (!(await canUpdateReport(req.auth, data))) {
      return unauthorized(res);
    }

    const result = await updateReport(
      {
        websiteId,
        userId,
        type,
        name,
        description,
        parameters: JSON.stringify(parameters),
      } as any,
      {
        id: reportId,
      },
    );

    return ok(res, result);
  }

  return methodNotAllowed(res);
};
