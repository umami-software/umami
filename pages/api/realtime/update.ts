import { ok, methodNotAllowed, badRequest, parseToken } from 'next-basics';
import { useAuth } from 'lib/middleware';
import { getRealtimeData } from 'queries';
import { SHARE_TOKEN_HEADER } from 'lib/constants';
import { secret } from 'lib/crypto';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { RealtimeUpdate } from 'lib/types';

export interface InitUpdateRequestQuery {
  startAt: string;
}

export default async (
  req: NextApiRequestQueryBody<InitUpdateRequestQuery>,
  res: NextApiResponse<RealtimeUpdate>,
) => {
  await useAuth(req, res);

  if (req.method === 'GET') {
    const { startAt } = req.query;

    const token = req.headers[SHARE_TOKEN_HEADER];

    if (!token) {
      return badRequest(res);
    }

    const { websites } = parseToken(token, secret());

    const data = await getRealtimeData(websites, new Date(+startAt));

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
