import { NextApiRequestQueryBody } from 'lib/types';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiResponse } from 'next';
import {
  badRequest,
  methodNotAllowed,
  ok,
  safeDecodeURIComponent,
  unauthorized,
} from 'next-basics';
import { EVENT_COLUMNS, FILTER_COLUMNS, SESSION_COLUMNS } from 'lib/constants';
import { getValues } from 'queries';
import { getRequestDateRange } from 'lib/request';
import * as yup from 'yup';

export interface ValuesRequestQuery {
  websiteId: string;
  type: string;
  startAt: number;
  endAt: number;
  search?: string;
}

const schema = {
  GET: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    type: yup.string().required(),
    startAt: yup.number().required(),
    endAt: yup.number().required(),
    search: yup.string(),
  }),
};

export default async (req: NextApiRequestQueryBody<ValuesRequestQuery>, res: NextApiResponse) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  const { websiteId, type, search } = req.query;
  const { startDate, endDate } = await getRequestDateRange(req);

  if (req.method === 'GET') {
    if (!SESSION_COLUMNS.includes(type as string) && !EVENT_COLUMNS.includes(type as string)) {
      return badRequest(res);
    }

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const values = await getValues(websiteId, FILTER_COLUMNS[type], startDate, endDate, search);

    return ok(
      res,
      values
        .map(({ value }) => safeDecodeURIComponent(value))
        .filter(n => n)
        .sort(),
    );
  }

  return methodNotAllowed(res);
};
