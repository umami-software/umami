import { startOfMinute, subMinutes } from 'date-fns';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getRealtimeData } from 'queries';
import * as yup from 'yup';
import { REALTIME_RANGE } from 'lib/constants';

export interface RealtimeRequestQuery {
  websiteId: string;
  timezone: string;
}

const schema = {
  GET: yup.object().shape({
    websiteId: yup.string().uuid().required(),
    timezone: yup.string().required(),
  }),
};

export default async (req: NextApiRequestQueryBody<RealtimeRequestQuery>, res: NextApiResponse) => {
  await useAuth(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'GET') {
    const { websiteId, timezone } = req.query;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const startDate = subMinutes(startOfMinute(new Date()), REALTIME_RANGE);

    const data = await getRealtimeData(websiteId, { startDate, timezone });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
