import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { TimezoneTest } from 'lib/yup';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getUTM } from 'queries';
import * as yup from 'yup';

export interface UTMRequestBody {
  websiteId: string;
  dateRange: { startDate: string; endDate: string; timezone: string };
}

const schema = {
  POST: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    dateRange: yup
      .object()
      .shape({
        startDate: yup.date().required(),
        endDate: yup.date().required(),
        timezone: TimezoneTest,
      })
      .required(),
  }),
};

export default async (req: NextApiRequestQueryBody<any, UTMRequestBody>, res: NextApiResponse) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'POST') {
    const {
      websiteId,
      dateRange: { startDate, endDate, timezone },
    } = req.body;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = await getUTM(websiteId, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      timezone,
    });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
