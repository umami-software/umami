import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getFunnel } from 'queries';
import * as yup from 'yup';

export interface FunnelRequestBody {
  websiteId: string;
  steps: { type: string; value: string }[];
  window: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface FunnelResponse {
  steps: { type: string; value: string }[];
  window: number;
  startAt: number;
  endAt: number;
}

const schema = {
  POST: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    steps: yup
      .array()
      .of(
        yup.object().shape({
          type: yup.string().required(),
          value: yup.string().required(),
        }),
      )
      .min(2)
      .required(),
    window: yup.number().positive().required(),
    dateRange: yup
      .object()
      .shape({
        startDate: yup.date().required(),
        endDate: yup.date().required(),
      })
      .required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<any, FunnelRequestBody>,
  res: NextApiResponse<FunnelResponse>,
) => {
  await useCors(req, res);
  await useAuth(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'POST') {
    const {
      websiteId,
      steps,
      window,
      dateRange: { startDate, endDate },
    } = req.body;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = await getFunnel(websiteId, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      steps,
      windowMinutes: +window,
    });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
