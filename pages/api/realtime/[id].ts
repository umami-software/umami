import { subMinutes } from 'date-fns';
import { RealtimeInit, NextApiRequestAuth } from 'lib/types';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { methodNotAllowed, ok } from 'next-basics';
import { getRealtimeData } from 'queries';

export default async (req: NextApiRequestAuth, res: NextApiResponse<RealtimeInit>) => {
  await useAuth(req, res);

  if (req.method === 'GET') {
    const { id, startAt } = req.query;
    let startTime = subMinutes(new Date(), 30);

    if (+startAt > startTime.getTime()) {
      startTime = new Date(+startAt);
    }

    const data = await getRealtimeData(id, startTime);

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
