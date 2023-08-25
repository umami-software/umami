import { canViewWebsite } from 'lib/auth';
import { useAuth, useCors, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getEventDataStats } from 'queries/index';
import * as yup from 'yup';

export interface EventDataStatsRequestQuery {
  websiteId: string;
  startAt: string;
  endAt: string;
}

const schema = {
  GET: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    startAt: yup.number().integer().required(),
    endAt: yup.number().integer().moreThan(yup.ref('startAt')).required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<EventDataStatsRequestQuery>,
  res: NextApiResponse<any>,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  req.yup = schema;
  await useValidate(req, res);

  if (req.method === 'GET') {
    const { websiteId, startAt, endAt } = req.query;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const startDate = new Date(+startAt);
    const endDate = new Date(+endAt);

    const data = await getEventDataStats(websiteId, { startDate, endDate });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
