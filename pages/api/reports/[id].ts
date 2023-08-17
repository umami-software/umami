import { canUpdateReport, canViewReport, canDeleteReport } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getReportById, updateReport, deleteReport } from 'queries';

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

  const { id: reportId } = req.query;
  const {
    user: { id: userId },
  } = req.auth;

  if (req.method === 'GET') {
    const report = await getReportById(reportId);

    if (!(await canViewReport(req.auth, report))) {
      return unauthorized(res);
    }

    report.parameters = JSON.parse(report.parameters);

    return ok(res, report);
  }

  if (req.method === 'POST') {
    const { websiteId, type, name, description, parameters } = req.body;

    const report = await getReportById(reportId);

    if (!(await canUpdateReport(req.auth, report))) {
      return unauthorized(res);
    }

    const result = await updateReport(reportId, {
      websiteId,
      userId,
      type,
      name,
      description,
      parameters: JSON.stringify(parameters),
    } as any);

    return ok(res, result);
  }

  if (req.method === 'DELETE') {
    const report = await getReportById(reportId);

    if (!(await canDeleteReport(req.auth, report))) {
      return unauthorized(res);
    }

    await deleteReport(reportId);

    return ok(res);
  }

  return methodNotAllowed(res);
};
