import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { TimezoneTest, UnitTypeTest } from 'lib/yup';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getRevenue } from 'queries/analytics/reports/getRevenue';
import * as yup from 'yup';

export interface RetentionRequestBody {
  websiteId: string;
  dateRange: { startDate: string; endDate: string; unit?: string; timezone?: string };
  eventName: string;
  revenueProperty: string;
  userProperty: string;
}

const schema = {
  POST: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    dateRange: yup
      .object()
      .shape({
        startDate: yup.date().required(),
        endDate: yup.date().required(),
        unit: UnitTypeTest,
        timezone: TimezoneTest,
      })
      .required(),
    eventName: yup.string().required(),
    revenueProperty: yup.string().required(),
    userProperty: yup.string(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<any, RetentionRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'POST') {
    const {
      websiteId,
      dateRange: { startDate, endDate, unit, timezone },
      eventName,
      revenueProperty,
      userProperty,
    } = req.body;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = await getRevenue(websiteId, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      unit,
      timezone,
      eventName,
      revenueProperty,
      userProperty,
    });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
