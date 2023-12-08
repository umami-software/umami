import { subMinutes } from 'date-fns';
import { canViewWebsite } from 'lib/auth';
import { useAuth, useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, RealtimeInit } from 'lib/types';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getRealtimeData } from 'queries';
import * as yup from 'yup';
export interface RealtimeRequestQuery {
  id: string;
  startAt: number;
}

const schema = {
  GET: yup.object().shape({
    id: yup.string().uuid().required(),
    startAt: yup.number().integer().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<RealtimeRequestQuery>,
  res: NextApiResponse<RealtimeInit>,
) => {
  await useAuth(req, res);
  await useValidate(schema, req, res);

  if (req.method === 'GET') {
    const { id: websiteId, startAt } = req.query;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    let startTime = subMinutes(new Date(), 30);

    if (+startAt > startTime.getTime()) {
      startTime = new Date(+startAt);
    }

    const data = await getRealtimeData(websiteId, startTime);

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
