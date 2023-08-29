import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getFunnel } from 'queries';
import * as yup from 'yup';

export interface FunnelRequestBody {
  websiteId: string;
  urls: string[];
  window: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface FunnelResponse {
  urls: string[];
  window: number;
  startAt: number;
  endAt: number;
}

const schema = {
  POST: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    urls: yup.array().min(2).of(yup.string()).required(),
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

  req.yup = schema;
  await useValidate(req, res);

  if (req.method === 'POST') {
    const {
      websiteId,
      urls,
      window,
      dateRange: { startDate, endDate },
    } = req.body;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = await getFunnel(websiteId, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      urls,
      windowMinutes: +window,
    });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
