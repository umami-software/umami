import * as yup from 'yup';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, SearchFilter } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getReportsByWebsiteId } from 'queries';
import { pageInfo } from 'lib/schema';

export interface ReportsRequestQuery extends SearchFilter {
  id: string;
}

const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
    ...pageInfo,
  }),
};

export default async (
  req: NextApiRequestQueryBody<ReportsRequestQuery, any>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { id: websiteId } = req.query;

  if (req.method === 'GET') {
    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const { page, query, pageSize } = req.query;

    const data = await getReportsByWebsiteId(websiteId, {
      page,
      pageSize: +pageSize || undefined,
      query,
    });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
