import { subMinutes } from 'date-fns';
import { RealtimeInit } from 'interface/api/models';
import { NextApiRequestAuth } from 'interface/api/nextApi';
import { secret } from 'lib/crypto';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { createToken, methodNotAllowed, ok } from 'next-basics';
import { getRealtimeData, getUserWebsites } from 'queries';

export default async (req: NextApiRequestAuth, res: NextApiResponse<RealtimeInit>) => {
  await useAuth(req, res);

  if (req.method === 'GET') {
    const { id: userId } = req.auth.user;

    const websites = await getUserWebsites({ userId });
    const ids = websites.map(({ id }) => id);
    const token = createToken({ websites: ids }, secret());
    const data = await getRealtimeData(ids, subMinutes(new Date(), 30));

    return ok(res, {
      websites,
      token,
      data,
    });
  }

  return methodNotAllowed(res);
};
