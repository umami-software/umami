import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, ReportSearchFilterType, SearchFilter } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getReportsByWebsiteId } from 'queries';

export interface ReportsRequestQuery extends SearchFilter<ReportSearchFilterType> {
  id: string;
}

import * as yup from 'yup';
const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<ReportsRequestQuery, any>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

  const { id: websiteId } = req.query;

  if (req.method === 'GET') {
    if (!(websiteId && (await canViewWebsite(req.auth, websiteId)))) {
      return unauthorized(res);
    }

    const { page, filter, pageSize } = req.query;

    const data = await getReportsByWebsiteId(websiteId, {
      page,
      filter,
      pageSize: +pageSize || null,
    });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
