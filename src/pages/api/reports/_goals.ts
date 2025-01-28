import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { TimezoneTest } from 'lib/yup';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getGoals } from 'queries/analytics/reports/getGoals';
import * as yup from 'yup';

export interface RetentionRequestBody {
  websiteId: string;
  dateRange: { startDate: string; endDate: string; timezone: string };
  goals: { type: string; value: string; goal: number }[];
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
    goals: yup
      .array()
      .of(
        yup.object().shape({
          type: yup
            .string()
            .matches(/url|event|event-data/i)
            .required(),
          value: yup.string().required(),
          goal: yup.number().required(),
          operator: yup
            .string()
            .matches(/count|sum|average/i)
            .when('type', {
              is: 'eventData',
              then: yup.string().required(),
            }),
          property: yup.string().when('type', {
            is: 'eventData',
            then: yup.string().required(),
          }),
        }),
      )
      .min(1)
      .required(),
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
      dateRange: { startDate, endDate },
      goals,
    } = req.body;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = await getGoals(websiteId, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      goals,
    });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
