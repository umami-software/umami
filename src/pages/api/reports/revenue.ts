import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { TimezoneTest, UnitTypeTest } from 'lib/yup';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getRevenue } from 'queries/analytics/reports/getRevenue';
import { getRevenueValues } from 'queries/analytics/reports/getRevenueValues';
import * as yup from 'yup';

export interface RevenueRequestBody {
  websiteId: string;
  currency?: string;
  timezone?: string;
  dateRange: { startDate: string; endDate: string; unit?: string };
}

const schema = {
  POST: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    timezone: TimezoneTest,
    dateRange: yup
      .object()
      .shape({
        startDate: yup.date().required(),
        endDate: yup.date().required(),
        unit: UnitTypeTest,
      })
      .required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<any, RevenueRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'GET') {
    const { websiteId, startDate, endDate } = req.query;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = await getRevenueValues(websiteId, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return ok(res, data);
  }

  if (req.method === 'POST') {
    const {
      websiteId,
      currency,
      timezone,
      dateRange: { startDate, endDate, unit },
    } = req.body;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = await getRevenue(websiteId, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      unit,
      timezone,
      currency,
    });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
