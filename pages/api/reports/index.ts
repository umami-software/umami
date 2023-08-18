import { canViewWebsite } from 'lib/auth';
import { uuid } from 'lib/crypto';
import { useAuth, useCors } from 'lib/middleware';
import { NextApiRequestQueryBody, ReportSearchFilterType, SearchFilter } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createReport, getReportsByUserId, getReportsByWebsiteId } from 'queries';

export interface ReportsRequestQuery extends SearchFilter<ReportSearchFilterType> {}

export interface ReportRequestBody {
  websiteId: string;
  name: string;
  type: string;
  description: string;
  parameters: {
    window: string;
    urls: string[];
  };
}

export default async (
  req: NextApiRequestQueryBody<any, ReportRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  const {
    user: { id: userId },
  } = req.auth;

  if (req.method === 'GET') {
    const { page, filter, pageSize } = req.query;

    const data = await getReportsByUserId(userId, {
      page,
      filter,
      pageSize: +pageSize || null,
      includeTeams: true,
    });

    return ok(res, data);
  }

  if (req.method === 'POST') {
    const { websiteId, type, name, description, parameters } = req.body;

    const result = await createReport({
      id: uuid(),
      userId,
      websiteId,
      type,
      name,
      description,
      parameters: JSON.stringify(parameters),
    } as any);

    return ok(res, result);
  }

  return methodNotAllowed(res);
};
