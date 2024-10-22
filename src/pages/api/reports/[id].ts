import { canDeleteReport, canUpdateReport, canViewReport } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, ReportType, YupRequest } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteReport, getReportById, updateReport } from 'queries';
import * as yup from 'yup';

export interface ReportRequestQuery {
  id: string;
}

export interface ReportRequestBody {
  websiteId: string;
  type: ReportType;
  name: string;
  description: string;
  parameters: string;
}

const schema: YupRequest = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
  }),
  POST: yup.object().shape({
    id: yup.string().uuid().required(),
    websiteId: yup.string().uuid().required(),
    type: yup
      .string()
      .matches(/funnel|insights|retention/i)
      .required(),
    name: yup.string().max(200).required(),
    description: yup.string().max(500),
    parameters: yup
      .object()
      .test('len', 'Must not exceed 6000 characters.', val => JSON.stringify(val).length < 6000),
  }),
  DELETE: yup.object().shape({
    id: yup.string().uuid().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<ReportRequestQuery, ReportRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

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
